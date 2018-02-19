# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

from ..tools import ApiController, AuthRequired, RESTController
from ..settings import Settings, Options


@ApiController('settings')
@AuthRequired()
class SettingsController(RESTController):

    def list(self):
        result = []

        for name, value in Options.__dict__.items():
            if not name.startswith('_'):
                default, data_type = value
                result.append({
                    'name': name,
                    'default': default,
                    'type': data_type.__name__,
                    'value':  getattr(Settings, name)
                })

        return result

    def get(self, name):
        try:
            attr = name.upper().replace('-', '_')
            default, data_type = getattr(Options, attr)
        except AttributeError:
            raise cherrypy.HTTPError(404)

        return {
            'name': attr,
            'default': default,
            'type': data_type.__name__,
            'value': getattr(Settings, attr)
        }

    @RESTController.args_from_json
    def set(self, name, value):
        try:
            setattr(Settings, name, value)
        except AttributeError:
            raise cherrypy.HTTPError(404)
