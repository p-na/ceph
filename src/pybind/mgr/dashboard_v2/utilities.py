# -*- coding: utf-8 -*-
from urlparse import ParseResult
import socket


def is_valid_ipv6_address(addr):
    try:
        socket.inet_pton(addr, socket.AF_INET6)
        return True
    except socket.error:
        return False


def build_url(host, scheme=None, port=None):
    """
    Build a valid URL. IPv6 addresses specified in host will be enclosed in brackets
    automatically.

    >>> build_url('example.com', 'https', 443)
    'https://example.com:443'

    >>> build_url(host='example.com', port=443)
    '//example.com:443'

    >>> build_url('fce:9af7:a667:7286:4917:b8d3:34df:8373', port=80, scheme='http')
    'http://[fce:9af7:a667:7286:4917:b8d3:34df:8373]:80'

    :param scheme: The scheme, e.g. http, https or ftp.
    :type scheme: str
    :param host: Consisting of either a registered name (including but not limited to
                 a hostname) or an IP address.
    :type host: str
    :type port: int
    :rtype: str
    """
    netloc = host if not is_valid_ipv6_address(host) else '[{}]'.format(host)
    if port:
        netloc += ':{}'.format(port)
    pr = ParseResult(scheme=scheme, netloc=netloc, path='', params='', query='', fragment='')
    return pr.geturl()
