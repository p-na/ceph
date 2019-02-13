from .helper import ControllerTestCase
from ..controllers.osd import Osd


class OsdTest(ControllerTestCase):
    @classmethod
    def setup_server(cls):
        Osd._cp_config['tools.authenticate.on'] = False
        cls.setup_controllers([Osd])

    def test_list(self):
        self._get('/api/osd/list')
        self.assertStatus(200)
