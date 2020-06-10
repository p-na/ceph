from unittest import TestCase
from unittest.mock import MagicMock, patch
import json
import os
import re

try:
    from typing import Iterable, Union, Tuple, Dict
except:
    pass

from .module import mgr, Module, Metric, OSD_POOL_STATS


def grep(
    keyword,  # type: Union[Iterable[str], str]
    iterable,  # type: Union[Iterable[str], str]
    ignore_comments=True,
):  # -> Tuple[int, Iterable]
    """
    >>> grep('bar', ['foo','bar', 'baz'])
    (1, ['bar'])

    >>> grep(['bar'], ['foo','bar', 'baz'])
    (1, ['bar'])

    >>> grep('bar', 'foo\\nbar\\nbaz')
    (1, ['bar'])

    >>> grep(['bar', 'baz'], 'foo\\nbar\\nbaz')
    (2, ['bar', 'baz'])
    """
    data = iterable
    if isinstance(iterable, str):
        data = iterable.split(os.linesep)

    keywords = keyword
    if isinstance(keyword, str):
        keywords = [keyword]

    def _filter(entry):
        if ignore_comments and re.match(r"^#", entry):
            return
        for keyword in keywords:
            if keyword in entry:
                return entry

    result = list(filter(_filter, data))
    return len(result), result


class MetricTest(TestCase):
    def test_re_metric(self):
        expectations = {
            "metric_name 5": ("metric_name", None, "5", None),
            'metric_name{label1="value1"} 5': ("metric_name", 'label1="value1"', '5', None),
        }
        for metric_str, expected_groups in expectations.items():
            match = re.match(Metric.re_metric, metric_str)
            if match:
                self.assertEqual(expected_groups, match.groups())
            else:
                raise Exception(
                    "Regular expression does not match given metric: {}".format(metric_str))

    def assertEqualMetric(self, first, second):
        # type: (Metric, Metric) -> None
        """
        Compare metric names, labels and values. Ignores types.
        """
        self.assertEqual(first.name, second.name)
        self.assertEqual(first.labelnames, second.labelnames)
        self.assertEqual(first.value, second.value)

    def test_parse_with_labels(self):
        expected_metric = Metric("untyped", "test_metric", "", ("label1", "label2"))
        expected_metric.set("value1", ("label1", )).set("value2", ("label2", )).set('10')
        self.assertEqualMetric(
            Metric.parse('test_metric{label1="value1",label2="value2"} 10'),
            expected_metric,
        )

    def test_parse_without_labels(self):
        expected_metric = Metric("untyped", "test_metric", "", None)
        expected_metric.set('5')
        self.assertEqualMetric(Metric.parse("test_metric 5"), expected_metric)


class ModuleTest(TestCase):
    @classmethod
    def setUpClass(cls):
        def loc_mod_opt(_, name, default):
            # Disables the gathering of metrics through the thread for easier testing
            if name == "disable_cache":
                return "true"  # expects a str
            return ""

        Module.get_localized_module_option = loc_mod_opt  # type: ignore
        Module._ceph_get_mgr_id = lambda _: 5  # type: ignore
        Module._ceph_have_mon_connection = lambda _: True  # type: ignore
        Module.get_service_list = lambda _: {  # type: ignore
            ("x", "mgr"): (
                "home",
                "ceph version Development (no_version) pacific (dev)",
            ),
            ("a", "mon"): (
                "home",
                "ceph version Development (no_version) pacific (dev)",
            ),
            ("b", "mon"): (
                "home",
                "ceph version Development (no_version) pacific (dev)",
            ),
            ("c", "mon"): (
                "home",
                "ceph version Development (no_version) pacific (dev)",
            ),
        }
        Module.list_servers = lambda _: [  # type: ignore
            {
                "hostname": "home",
                "services": [
                    {"type": "mgr", "id": "x"},
                    {"type": "mon", "id": "a"},
                    {"type": "mon", "id": "b"},
                    {"type": "mon", "id": "c"},
                ],
                "ceph_version": "ceph version Development (no_version) pacific (dev)",
            }
        ]

        def get_all_perf_counters(_):
            with open("fixtures/get_all_perf_counters.json", "r") as fh:
                data = os.linesep.join(fh.readlines())
            return json.loads(data)

        Module.get_all_perf_counters = get_all_perf_counters  # type: ignore

        def mock_get(self, data_name):
            """
            Mocks all requests to `mgr.get` and returns their corresponding fixtures.
            """

            try:
                with open("fixtures/{}.json".format(data_name), "r") as fh:
                    data = os.linesep.join(fh.readlines())
                    return json.loads(data)
            except OSError as e:
                raise OSError(
                    "fixture fixtures/{}.json not found or unable to open".format(
                        data_name
                    )
                )

            except json.decoder.JSONDecodeError as e:
                raise json.decoder.JSONDecodeError(
                    "Error decoding fixtures/{}.json: {}\n\ndata:{}".format(
                        data_name, str(e), data
                    ),
                    e.doc,
                    e.pos,
                )

        Module.get = mock_get  # type: ignore

    def setUp(self):
        self.module = Module("Prometheus", "", "")
        self.collect_data = self.module.collect()

    def test_get_health(self):
        size, _ = grep("ceph_health_status", self.collect_data)
        self.assertEqual(size, 1)

    def test_get_pool_stats(self):
        pool_count = 3  # determined through fixture
        expected_stats = ["ceph_pool_{}".format(stat) for stat in OSD_POOL_STATS]
        size, _ = grep(expected_stats, self.collect_data)
        self.assertEqual(size, len(OSD_POOL_STATS) * pool_count)

    def test_collect_time(self):
        methods = [
            'get_health',
            'get_pool_stats',
            'get_df',
            'get_fs',
            'get_quorum_status',
            'get_mgr_status',
            'get_pg_status',
            'get_osd_stats',
            'get_metadata_and_osd_status',
            'get_num_objects',
            'get_rbd_stats',
        ]
        _, data = grep("ceph_collect_time", self.collect_data)
        size, _ = grep(methods, data)
        self.assertEqual(size, len(methods))
