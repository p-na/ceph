import unittest
from collections import defaultdict
from pprint import pprint

paths = [
    'rgw/daemon/foo/bar/baz',  # Supposed to fail
    'rgw/daemon/foo',
    'rgw/daemon/bar',
    'rgw/daemon/baz',
    'rgw/daemon',
    'rgw',
]

expected_result = {
    'rgw': ['daemon'],
    'rgw/daemon': ['foo', 'bar', 'baz'],
    'rgw/daemon/foo/bar': ['baz']
}


def paths_to_dict(paths):
    def path_to_dict(path):
        if '/' in path:
            parts = path.split('/')
            key = '/'.join(parts[:-1])
            value = parts[-1]

            return key, value
        return '', ''

    result = defaultdict(list)
    for path in paths:
        key, value = path_to_dict(path)
        if key:
            result[key].append(value)

    return result

pprint(paths_to_dict(paths))
