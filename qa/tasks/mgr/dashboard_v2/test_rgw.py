# -*- coding: utf-8 -*-
from __future__ import absolute_import

from .helper import DashboardTestCase, authenticate


class RgwControllerTest(DashboardTestCase):
    @authenticate
    def test_rgw_daemon_list(self):
        data = self._get('/api/rgw/daemon')
        self.assertStatus(200)

        self.assertEqual(len(data), 1)
        data = data[0]
        self.assertIn('id', data)
        self.assertIn('version', data)
        self.assertIn('server_hostname', data)

    @authenticate
    def test_rgw_daemon_get(self):
        data = self._get('/api/rgw/daemon')
        self.assertStatus(200)
        data = self._get('/api/rgw/daemon/{}'.format(data[0]['id']))
        self.assertStatus(200)

        self.assertIn('rgw_metadata', data)
        self.assertIn('rgw_id', data)
        self.assertIn('rgw_status', data)
        self.assertTrue(data['rgw_metadata'])


class RgwProxyTest(DashboardTestCase):

    @authenticate
    def test_rgw_proxy_get(self):
        self._get('/api/rgw/proxy/usage')
        self.assertJsonBody({"entries": [], "summary": []})

    @authenticate
    def test_rgw_proxy_put(self):
        resp = self._put('/api/rgw/proxy/user/', {
            'uid': 'rgw-test-user',
            'display-name': 'rgw-test-user displayname',
            'access-key': 'foo',
            'secret-key': 'bar',
        })
        pass
        self.assertTrue(False)
