# -*- coding: utf-8 -*-
from __future__ import absolute_import

import re
from awsauth import S3Auth
from ..settings import Settings, Options
from ..components.rest_client import RestClient, RequestException
from ..tools import build_url, isset
from .. import mgr, logger


class RgwClient(RestClient):
    _SYSTEM_USERID = None
    _ADMIN_PATH = None
    _host = None
    _port = None
    _ssl = None
    _user_instances = {}

    class NoCredentialsException(Exception):
        def __init__(self):
            super(RgwClient.NoCredentialsException,
                  self).__init__('No RGW credentials found')

    @staticmethod
    def _determine_rgw_addr():
        service_map = mgr.get('service_map')

        if not isset(service_map, ['services', 'rgw', 'daemons', 'rgw']):
            msg = 'No RGW found.'
            raise LookupError(msg)

        daemon = service_map['services']['rgw']['daemons']['rgw']
        addr = daemon['addr'].split(':')[0]
        match = re.search(r'port=(\d+)',
                          daemon['metadata']['frontend_config#0'])
        if match:
            port = int(match.group(1))
        else:
            msg = 'Failed to determine RGW port'
            raise LookupError(msg)

        return addr, port

    @staticmethod
    def _load_settings():
        if all((Settings.RGW_API_SCHEME, Settings.RGW_API_ACCESS_KEY, Settings.RGW_API_SECRET_KEY)):

            if Options.has_default_value('RGW_API_HOST') and \
                    Options.has_default_value('RGW_API_PORT'):
                host, port = RgwClient._determine_rgw_addr()
            else:
                host, port = Settings.RGW_API_HOST, Settings.RGW_API_PORT

            credentials = {
                'host': host,
                'port': port,
                'scheme': Settings.RGW_API_SCHEME,
                'admin_path': Settings.RGW_API_ADMIN_RESOURCE,
                'user_id': Settings.RGW_API_USER_ID,
                'access_key': Settings.RGW_API_ACCESS_KEY,
                'secret_key': Settings.RGW_API_SECRET_KEY
            }
        else:
            raise RgwClient.NoCredentialsException()

        RgwClient._host = credentials['host']
        RgwClient._port = credentials['port']
        RgwClient._ssl = credentials['scheme'] == 'https'
        logger.info("Creating new connection for user: %s",
                    credentials['user_id'])
        RgwClient._ADMIN_PATH = credentials['admin_path']
        RgwClient._SYSTEM_USERID = credentials['user_id']
        RgwClient._user_instances[RgwClient._SYSTEM_USERID] = \
            RgwClient(credentials['user_id'], credentials['access_key'],
                      credentials['secret_key'], host=host, port=port)

    @staticmethod
    def instance(userid):
        if not RgwClient._user_instances:
            RgwClient._load_settings()
        if not userid:
            userid = RgwClient._SYSTEM_USERID
        if userid not in RgwClient._user_instances:
            logger.info("Creating new connection for user: %s", userid)
            keys = RgwClient.admin_instance().get_user_keys(userid)
            if not keys:
                raise Exception(
                    "User '{}' does not have any keys configured.".format(
                        userid))

            RgwClient._user_instances[userid] = RgwClient(
                userid, keys['access_key'], keys['secret_key'])
        return RgwClient._user_instances[userid]

    @staticmethod
    def admin_instance():
        return RgwClient.instance(RgwClient._SYSTEM_USERID)

    def _reset_login(self):
        if self.userid != RgwClient._SYSTEM_USERID:
            logger.info("Fetching new keys for user: %s", self.userid)
            keys = RgwClient.admin_instance().get_user_keys(self.userid)
            self.auth = S3Auth(keys['access_key'], keys['secret_key'],
                               service_url=self.service_url)
        else:
            raise RequestException('Authentication failed for the "{}" user: wrong credentials'
                                   .format(self.userid), status_code=401)

    def __init__(self,
                 userid,
                 access_key,
                 secret_key,
                 host='::',
                 port=8000,
                 admin_path='admin',
                 ssl=False):

        self.userid = userid
        self.service_url = build_url(host=host, port=port)
        self.admin_path = admin_path

        s3auth = S3Auth(access_key, secret_key, service_url=self.service_url)
        super(RgwClient, self).__init__(host, port, 'RGW', ssl, s3auth)

        logger.info("Creating new connection")

    @RestClient.api_get('/', resp_structure='[0] > ID')
    def is_service_online(self, request=None):
        response = request({'format': 'json'})
        return response[0]['ID'] == 'online'

    @RestClient.api_get('/{admin_path}/metadata/user', resp_structure='[+]')
    def _is_system_user(self, admin_path, request=None):
        response = request()
        return self.userid in response

    def is_system_user(self):
        return self._is_system_user(self.admin_path)

    @RestClient.api_get(
        '/{admin_path}/user',
        resp_structure='tenant & user_id & email & keys[*] > '
        ' (user & access_key & secret_key)')
    def _admin_get_user_keys(self, admin_path, userid, request=None):
        colon_idx = userid.find(':')
        user = userid if colon_idx == -1 else userid[:colon_idx]
        response = request({'uid': user})
        for keys in response['keys']:
            if keys['user'] == userid:
                return {
                    'access_key': keys['access_key'],
                    'secret_key': keys['secret_key']
                }

    def get_user_keys(self, userid):
        return self._admin_get_user_keys(self.admin_path, userid)

    @RestClient.api('/{admin_path}/{path}')
    def _proxy_request(self,
                       admin_path,
                       path,
                       method,
                       params,
                       data,
                       request=None):
        return request(
            method=method, params=params, data=data, raw_content=True)

    def proxy(self, method, path, params, data):
        logger.debug("proxying method=%s path=%s params=%s data=%s", method,
                     path, params, data)
        return self._proxy_request(self.admin_path, path, method, params, data)

    @RestClient.api_get('/', resp_structure='[1][*] > Name')
    def get_buckets(self, request=None):
        """
        Get a list of names from all existing buckets of this user.
        :return: Returns a list of bucket names.
        """
        response = request({'format': 'json'})
        return [bucket['Name'] for bucket in response[1]]

    @RestClient.api_get('/{bucket_name}')
    def bucket_exists(self, bucket_name, userid, request=None):
        """
        Check if the specified bucket exists for this user.
        :param bucket_name: The name of the bucket.
        :return: Returns True if the bucket exists, otherwise False.
        """
        try:
            request()
            my_buckets = self.get_buckets()
            if bucket_name not in my_buckets:
                raise RequestException(
                    'Bucket "{}" belongs to other user'.format(bucket_name),
                    403)
            return True
        except RequestException as e:
            if e.status_code == 404:
                return False
            else:
                raise e

    @RestClient.api_put('/{bucket_name}')
    def create_bucket(self, bucket_name, request=None):
        logger.info("Creating bucket: %s", bucket_name)
        return request()
