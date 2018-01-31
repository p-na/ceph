# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

from ..tools import ApiController, RESTController
from ..components.rgw_client import RgwClient


@ApiController('rgw')
class Rgw(RESTController):
    def __init__(self):
        self.access_key = '5K8249JVTJ98NIKC4YK8'
        self.secret_key = 'XcnDjYuRDCwS4IiWVk0kgEeZjV2G8fhAUefm3Lwh'

    @cherrypy.expose
    def default(self, *vpath, **params):
        # import pydevd
        # pydevd.settrace('10.163.9.165', port=22222, stdoutToServer=True, stderrToServer=True)

        try:
            rgw_client = RgwClient(self.access_key, self.secret_key, host='localhost')
        except RgwClient.NoCredentialsException as e:
            # TODO do something meaningful here
            pass

        # method = cherrypy.request.
        method = cherrypy.request.method
        path = '/'.join(vpath)
        # data = cherrypy.request.data
        data = None
        return rgw_client.proxy(method, path, params, data)

        return '''<pre>yes</pre>'''

