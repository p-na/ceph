# -*- coding: utf-8 -*-
from __future__ import absolute_import

import unittest
import cherrypy
from cherrypy.lib.sessions import RamSession
from cherrypy.test import helper
from mock import patch

from .helper import RequestHelper
from ..tools import RESTController, is_valid_ipv6_address


# pylint: disable=W0613
class FooResource(RESTController):
    elems = []

    def list(self, *vpath, **params):
        return FooResource.elems

    def create(self, data, *args, **kwargs):
        FooResource.elems.append(data)
        return data

    def get(self, key, *args, **kwargs):
        return FooResource.elems[int(key)]

    def delete(self, key):
        del FooResource.elems[int(key)]

    def bulk_delete(self):
        FooResource.elems = []


class FooArgs(RESTController):
    @RESTController.args_from_json
    def set(self, code, name):
        return {'code': code, 'name': name}


# pylint: disable=C0102
class Root(object):
    foo = FooResource()
    fooargs = FooArgs()


class RESTControllerTest(helper.CPWebCase, RequestHelper):
    @classmethod
    def setup_server(cls):
        cherrypy.tree.mount(Root())

    def test_empty(self):
        self._delete("/foo")
        self.assertStatus(204)
        self._get("/foo")
        self.assertStatus('200 OK')
        self.assertHeader('Content-Type', 'application/json')
        self.assertBody('[]')

    def test_fill(self):
        sess_mock = RamSession()
        with patch('cherrypy.session', sess_mock, create=True):
            data = {'a': 'b'}
            for _ in range(5):
                self._post("/foo", data)
                self.assertJsonBody(data)
                self.assertStatus(201)
                self.assertHeader('Content-Type', 'application/json')

            self._get("/foo")
            self.assertStatus('200 OK')
            self.assertHeader('Content-Type', 'application/json')
            self.assertJsonBody([data] * 5)

    def test_not_implemented(self):
        self._put("/foo")
        self.assertStatus(405)

    def test_args_from_json(self):
        self._put("/fooargs/hello", {'name': 'world'})
        self.assertJsonBody({'code': 'hello', 'name': 'world'})


class IpTest(unittest.TestCase):

    def test_is_valid_ipv6_address(self):
        self.assertTrue(is_valid_ipv6_address('::'))
        self.assertTrue(is_valid_ipv6_address('::1'))
        self.assertFalse(is_valid_ipv6_address('127.0.0.1'))
        self.assertFalse(is_valid_ipv6_address('localhost'))
        self.assertTrue(is_valid_ipv6_address('1200:0000:AB00:1234:0000:2552:7777:1313'))
        self.assertFalse(is_valid_ipv6_address('1200::AB00:1234::2552:7777:1313'))
