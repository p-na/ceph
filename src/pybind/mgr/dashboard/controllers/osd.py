# -*- coding: utf-8 -*-
from __future__ import absolute_import

from . import ApiController, AuthRequired, RESTController
from .. import mgr

from ..services.ceph_service import CephService
from ..services.exception import handle_send_command_error
from ..tools import str_to_bool
from .. import logger


@ApiController('/osd')
@AuthRequired()
class Osd(RESTController):
    def list(self):
        osds = self._get_osd_map()
        # Extending by osd stats information
        for stats in mgr.get('osd_stats')['osd_stats']:
            osds[str(stats['osd'])].update({'osd_stats': stats})
        # Extending by osd node information
        nodes = mgr.get('osd_map_tree')['nodes']
        osd_tree = [(str(osd['id']), osd) for osd in nodes if osd['id'] >= 0]
        for osd in osd_tree:
            osds[osd[0]].update({'tree': osd[1]})
        # Extending by osd parent node information
        hosts = [(host['name'], host) for host in nodes if host['id'] < 0]
        for host in hosts:
            for osd_id in host[1]['children']:
                if osd_id >= 0:
                    osds[str(osd_id)]['host'] = host[1]
        # Extending by osd histogram data
        for osd_id in osds:
            osd = osds[osd_id]
            osd['stats'] = {}
            osd['stats_history'] = {}
            osd_spec = str(osd['osd'])
            for stats in ['osd.op_w', 'osd.op_in_bytes', 'osd.op_r', 'osd.op_out_bytes']:
                prop = stats.split('.')[1]
                osd['stats'][prop] = CephService.get_rate('osd', osd_spec, stats)
                osd['stats_history'][prop] = CephService.get_rates('osd', osd_spec, stats)
            # Gauge stats
            for stats in ['osd.numpg', 'osd.stat_bytes', 'osd.stat_bytes_used']:
                osd['stats'][stats.split('.')[1]] = mgr.get_latest('osd', osd_spec, stats)
        return list(osds.values())

    @staticmethod
    def _get_osd_map():
        osds = {}
        for osd in mgr.get('osd_map')['osds']:
            osd['id'] = osd['osd']
            osds[str(osd['id'])] = osd
        return osds

    @handle_send_command_error('osd')
    def get(self, svc_id):
        histogram = CephService.send_command('osd', srv_spec=svc_id, prefix='perf histogram dump')
        return {
            'osd_map': self._get_osd_map()[svc_id],
            'osd_metadata': mgr.get_metadata('osd', svc_id),
            'histogram': histogram,
        }

    @RESTController.Resource('POST', query_params=['deep'])
    def scrub(self, svc_id, deep=False):
        api_scrub = "osd deep-scrub" if str_to_bool(deep) else "osd scrub"
        CephService.send_command("mon", api_scrub, who=svc_id)

    @RESTController.Resource('POST')
    def down(self, svc_id):
        logger.info('DEBUG', svc_id)
        logger.debug('DEBUG', svc_id)
        # CephService.send_command('mon', 'osd down {}'.format(svc_id))

    @RESTController.Resource('POST')
    def up(self, *svc_ids):
        for svc_id in svc_ids:
            CephService.send_command('mon', 'osd up {}'.format(svc_id))

    @RESTController.Resource('POST', )
    def set_in(self, *svc_ids):
        pass
