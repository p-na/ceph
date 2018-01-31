# -*- coding: utf-8 -*-
from __future__ import absolute_import

import logging
from awsauth import S3Auth
# from oa_settings import Settings
from ..components.rest_client import RestClient, RequestException
from ..utilities import build_url

logger = logging.getLogger(__name__)


class RgwClient(RestClient):
    class NoCredentialsException(Exception):
        def __init__(self):
            super(RgwClient.NoCredentialsException, self).__init__('No RGW credentials found')

    def __init__(self, access_key, secret_key, host='::', port=8000, admin_path='admin',
                 ssl=False):

        self.service_url = build_url(host=host, port=port)
        self.admin_path = admin_path

        s3auth = S3Auth(access_key, secret_key, service_url=self.service_url)
        super(RgwClient, self).__init__(host, port, 'RGW', ssl, s3auth)

        logger.info("Creating new connection")

    @RestClient.api_get('/', resp_structure='[0] > ID')
    def is_service_online(self, request=None):
        response = request({
            'format': 'json'
        })
        return response[0]['ID'] == 'online'

    @RestClient.api_get('/{admin_path}/metadata/user', resp_structure='[+]')
    def _is_system_user(self, admin_path, request=None):
        response = request()
        return self.userid in response

    def is_system_user(self):
        return self._is_system_user(self.admin_path)

    @RestClient.api_get('/{admin_path}/user', resp_structure='tenant & user_id & email & keys[*] > '
                                                             ' (user & access_key & secret_key)')
    def _admin_get_user_keys(self, admin_path, userid, request=None):
        colon_idx = userid.find(':')
        user = userid if colon_idx == -1 else userid[:colon_idx]
        response = request({
            'uid': user
        })
        for keys in response['keys']:
            if keys['user'] == userid:
                return {
                    'access_key': keys['access_key'],
                    'secret_key': keys['secret_key']
                }

    def get_user_keys(self, userid):
        return self._admin_get_user_keys(self.admin_path, userid)

    @RestClient.api('/{admin_path}/{path}')
    def _proxy_request(self, admin_path, path, method, params, data, request=None):
        return request(method=method, params=params, data=data, raw_content=True)

    def proxy(self, method, path, params, data):
        logger.debug("proxying method=%s path=%s params=%s data=%s", method, path, params, data)
        return self._proxy_request(self.admin_path, path, method, params, data)

    @RestClient.api_get('/', resp_structure='[1][*] > Name')
    def get_buckets(self, request=None):
        """
        Get a list of names from all existing buckets of this user.
        :return: Returns a list of bucket names.
        """
        response = request({
            'format': 'json'
        })
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
                raise RequestException('Bucket "{}" belongs to other user'.format(bucket_name),
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
