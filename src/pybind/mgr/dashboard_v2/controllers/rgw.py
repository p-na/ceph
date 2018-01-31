# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

from ..tools import ApiController, RESTController
from ..components.rgw_client import RgwClient


@ApiController('rgw')
class Rgw(RESTController):
    def __init__(self):
        self.access_key = self.mgr.get_localized_config('rgw_access_key', '')
        self.secret_key = self.mgr.get_localized_config('rgw_secret_key', '')

    @cherrypy.expose
    def default(self, *vpath, **params):
        # import pydevd
        # pydevd.settrace('10.100.209.166', port=22222, stdoutToServer=True, stderrToServer=True)

        try:
            rgw_client = RgwClient(self.access_key, self.secret_key)
        except RgwClient.NoCredentialsException as e:
            # TODO do something meaningful here
            pass

        # method = cherrypy.request.

        # return rgw_client.proxy(method, path, params, data)

        return '''<pre>yes</pre>'''

