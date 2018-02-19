# -*- coding: utf-8 -*-
from __future__ import absolute_import

from .helper import ControllerTestCase, authenticate


class SettingsControllerTest(ControllerTestCase):

    @authenticate
    def test_settings_list(self):
        data = self._get('/api/settings/')
        self.assertTrue(len(data) > 0)
        self.assertStatus(200)
        self.assertIn('default', data[0].keys())
        self.assertIn('type', data[0].keys())
        self.assertIn('name', data[0].keys())
        self.assertIn('value', data[0].keys())

    @authenticate
    def test_rgw_daemon_get(self):
        data = self._get('/api/settings/grafana-api-username')
        self.assertStatus(200)
        self.assertEqual({
            u'default': u'admin',
            u'type': u'str',
            u'name': u'GRAFANA_API_USERNAME',
            u'value': u'admin',
        }, data)
        self.assertIn('default', data)
        self.assertIn('type', data)
        self.assertIn('name', data)
        self.assertIn('value', data)

    @authenticate
    def test_set(self):
        self._put('/api/settings/GRAFANA_API_USERNAME', {'value': 'foo'},)
        self.assertStatus(200)

        self._get('/api/settings/GRAFANA_API_USERNAME')
        self.assertStatus(200)
        self.assertIn('default', self.jsonBody())
        self.assertIn('type', self.jsonBody())
        self.assertIn('name', self.jsonBody())
        self.assertIn('value', self.jsonBody())
        self.assertEqual(self.jsonBody()['value'], 'foo')

        self._put('/api/settings/GRAFANA_API_USERNAME', {'value': 'admin'},)
        self.assertStatus(200)
