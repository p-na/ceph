# -*- coding: utf-8 -*-
from __future__ import absolute_import

import json

from ..tools import ApiController, RESTController
from .. import logger


@ApiController('rgw')
class Rgw(RESTController):

    def __init__(self):
        self.daemon = RgwDaemon()


@ApiController()
class RgwDaemon(RESTController):

    def list(self):
        daemons = []
        for server in self.mgr.list_servers():
            for service in server['services']:
                if service['type'] == 'rgw':
                    metadata = self.mgr.get_metadata('rgw', service['id'])
                    status = self.mgr.get_daemon_status('rgw', service['id'])
                    try:
                        status = json.loads(status['json'])
                    except:
                        logger.warn("{0} had invalid status json".format(service['id']))
                        status = {}

                    # extract per-daemon service data and health
                    daemon = {
                        'id': service['id'],
                        'version': metadata['ceph_version'],
                        'server_hostname': server['hostname'],
                        'service': service,
                        'server': server,
                        'metadata': metadata,
                        'status': status,
                        'url': "{0}/api/rgw/daemon/{1}".format(self.mgr.url_prefix, service['id'])
                    }

                    daemons.append(daemon)

        return {'daemons': sorted(daemons, key=lambda k: k['id'])}

    def get(self, service_id):
        daemon = {
            'rgw_metadata': [],
            'rgw_id': service_id,
            'rgw_status': []
        }
        for server in self.mgr.list_servers():
            for service in server['services']:
                if service['type'] == 'rgw' and service['id'] == service_id:
                    metadata = self.mgr.get_metadata('rgw', service['id'])
                    status = self.mgr.get_daemon_status('rgw', service['id'])
                    try:
                        status = json.loads(status['json'])
                    except:
                        logger.warn("{0} had invalid status json".format(service['id']))
                        status = {}

                    daemon['rgw_metadata'] = metadata
                    daemon['rgw_status'] = status

                    break
        return daemon
