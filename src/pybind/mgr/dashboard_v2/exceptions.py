# -*- coding: utf-8 -*-
from __future__ import absolute_import


class NoCredentialsException(Exception):
    def __init__(self):
        super(RgwClient.NoCredentialsException,
              self).__init__('No RGW credentials found')
