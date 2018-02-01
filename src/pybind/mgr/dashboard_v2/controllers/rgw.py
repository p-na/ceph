# -*- coding: utf-8 -*-
from __future__ import absolute_import

import re
import json
import cherrypy

from ..tools import ApiController, RESTController, isset
from ..components.rgw_client import RgwClient
from mgr_module import MgrModule, CommandResult

@ApiController('rgw')
class Rgw(RESTController):
    def __init__(self):
        self.access_key = '5K8249JVTJ98NIKC4YK8'
        self.secret_key = 'XcnDjYuRDCwS4IiWVk0kgEeZjV2G8fhAUefm3Lwh'

    @cherrypy.expose
    def default(self, *vpath, **params):
        import pydevd
        pydevd.settrace('10.163.9.165', port=22222, stdoutToServer=True, stderrToServer=True)

        host, port = self._determine_rgw_addr()

        try:
            rgw_client = RgwClient(self.access_key, self.secret_key, host=host, port=port)
        except RgwClient.NoCredentialsException as e:
            # TODO do something meaningful here
            pass

        # method = cherrypy.request.
        method = cherrypy.request.method
        path = '/'.join(vpath)
        # data = cherrypy.request.data
        data = None
        return rgw_client.proxy(method, path, params, data)

    def _determine_rgw_credentials(self):
        pass

    def _determine_rgw_addr(self):
        # TODO abstract this away!
        result = CommandResult("")
        self.mgr.send_command(result, "mon", "", json.dumps({
            "prefix": "status",
            "format": "json",
        }), "")
        result.wait()

        try:
            status = json.loads(result.outb)
        except ValueError:
            return False

        # TODO check if [...]['services']['rgw'] always exist
        # TODO check how the output looks like if there's more than one RGW!
        if not isset(status, ['servicemap', 'services', 'rgw', 'daemons', 'rgw']):
            raise NotImplementedError('Whoops, we didn\'t expect that return format')

        rgw_service = status['servicemap']['services']['rgw']['daemons']['rgw']
        addr = rgw_service['addr'].split(':')[0]
        match = re.search(r'port=(\d+)', rgw_service['metadata']['frontend_config#0'])
        if match:
            port = int(match.group(1))
        else:
            return False

        return addr, port
