# -*- coding: utf-8 -*-
from __future__ import absolute_import
import urllib

from .helper import DashboardTestCase, authenticate
import logging
from pprint import pformat

log = logging.getLogger(__name__)


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

    def _assert_user_data(self, data):
        self.assertIn('caps', data)
        self.assertIn('display_name', data)
        self.assertIn('email', data)
        self.assertIn('keys', data)
        self.assertGreaterEqual(len(data['keys']), 1)
        self.assertIn('max_buckets', data)
        self.assertIn('subusers', data)
        self.assertIn('suspended', data)
        self.assertIn('swift_keys', data)
        self.assertIn('tenant', data)
        self.assertIn('user_id', data)

    @authenticate
    def test_rgw_proxy(self):
        self.maxDiff = None

        # Create a user
        args = {
            'uid': 'teuth-test-user',
            'display-name': 'display name',
        }
        url = '/api/rgw/proxy/user?{}'.format(urllib.urlencode(args))
        self._put(url)
        data = self._resp.json()
        self._assert_user_data(data)
        self.assertStatus(200)

        # Get the user details
        args = {'uid': 'teuth-test-user'}
        url = '/api/rgw/proxy/user?{}'.format(urllib.urlencode(args))
        data = self._get(url)
        self._assert_user_data(data)
        self.assertStatus(200)
        self.assertEquals(data['user_id'], 'teuth-test-user')

        # Update the user details
        args = {'uid': 'teuth-test-user', 'display-name': 'new name',}
        url = '/api/rgw/proxy/user?{}'.format(urllib.urlencode(args))
        self._post(url)
        data = self._resp.json()
        log.error(pformat(data))
        self.assertStatus(200)
        self._assert_user_data(data)
        self.assertEqual(data['display_name'], 'new name')

        # Delete the user
        args = {'uid': 'teuth-test-user'}
        url = '/api/rgw/proxy/user?{}'.format(urllib.urlencode(args))
        self._delete(url)
        self.assertStatus(200)

