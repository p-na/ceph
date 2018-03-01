# -*- coding: utf-8 -*-
from __future__ import absolute_import

import json

import cherrypy

from .. import logger
from ..services.ceph_service import CephService
from ..tools import ApiController, RESTController, AuthRequired
from ..components.rgw_client import RgwClient


@ApiController('rgw')
@AuthRequired()
class RgwRoot(RESTController):
    pass


@ApiController('rgw/daemon')
@AuthRequired()
class RgwDaemon(RESTController):

    def list(self):
        daemons = []
        for hostname, server in CephService.get_service_map('rgw').items():
            for service in server['services']:
                metadata = service['metadata']
                status = service['status']
                if 'json' in status:
                    try:
                        status = json.loads(status['json'])
                    except ValueError:
                        logger.warning("%s had invalid status json", service['id'])
                        status = {}
                else:
                    logger.warning('%s has no key "json" in status', service['id'])

                # extract per-daemon service data and health
                daemon = {
                    'id': service['id'],
                    'version': metadata['ceph_version'],
                    'server_hostname': hostname
                }

                daemons.append(daemon)

        return sorted(daemons, key=lambda k: k['id'])

    def get(self, svc_id):
        daemon = {
            'rgw_metadata': [],
            'rgw_id': svc_id,
            'rgw_status': []
        }
        service = CephService.get_service('rgw', svc_id)
        if not service:
            return daemon

        metadata = service['metadata']
        status = service['status']
        if 'json' in status:
            try:
                status = json.loads(status['json'])
            except ValueError:
                logger.warning("%s had invalid status json", service['id'])
                status = {}
        else:
            logger.warning('%s has no key "json" in status', service['id'])

        daemon['rgw_metadata'] = metadata
        daemon['rgw_status'] = status

        return daemon


@ApiController('rgw/proxy')
@AuthRequired()
class RgwProxy(RESTController):
    @cherrypy.expose
    def default(self, *vpath, **params):
        rgw_client = RgwClient.admin_instance()
        method = cherrypy.request.method
        path = '/'.join(vpath)
        data = None
        if cherrypy.request.body.length is not None:
            cherrypy.request.body.read()

        return rgw_client.proxy(method, path, params, data)
