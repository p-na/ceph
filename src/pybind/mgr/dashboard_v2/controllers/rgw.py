# -*- coding: utf-8 -*-
from __future__ import absolute_import

import json
import re

import cherrypy

from .. import logger, mgr
from ..services.ceph_service import CephService
from ..tools import ApiController, RESTController, AuthRequired, isset
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

    @staticmethod
    def _determine_rgw_addr():
        service_map = mgr.get('service_map')

        if not isset(service_map, ['services', 'rgw', 'daemons', 'rgw']):
            msg = 'No RGW found.'
            raise LookupError(msg)

        daemon = service_map['services']['rgw']['daemons']['rgw']
        if daemon['metadata']['zonegroup_name'] != 'default' or \
                daemon['metadata']['zone_name'] != 'default':
            msg = 'Automatically determining RGW daemon failed.'
            raise LookupError(msg)

        addr = daemon['addr'].split(':')[0]
        match = re.search(r'port=(\d+)', daemon['metadata']['frontend_config#0'])
        if match:
            port = int(match.group(1))
        else:
            msg = 'Failed to determine RGW port'
            raise LookupError(msg)

        return addr, port
