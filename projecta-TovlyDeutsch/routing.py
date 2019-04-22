from ryu.base import app_manager
from ryu.controller import ofp_event, dpset
from ryu.controller.handler import MAIN_DISPATCHER
from ryu.controller.handler import set_ev_cls
from ryu.lib.ip import ipv4_to_bin
import math


class Controller(app_manager.RyuApp):
    # set up links for ToRs
    def setup_lower_aggr(self, sw, ofproto, k, swNum, p_type):
        first_uplink = int((k / 2) + 1)
        uplink_diff = 0
        # if packets are destined for same rack, send them there
        for out_port in range(1, first_uplink):
            host_num = (swNum - 1) * int((k / 2)) + out_port
            match = sw.ofproto_parser.OFPMatch(
                dl_type=p_type, nw_dst=((10 << 24) + host_num))
            action = sw.ofproto_parser.OFPActionOutput(out_port)
            mod = sw.ofproto_parser.OFPFlowMod(
                datapath=sw, match=match, cookie=0,
                command=ofproto.OFPFC_ADD, idle_timeout=0, hard_timeout=0,
                priority=2,
                flags=ofproto.OFPFF_SEND_FLOW_REM, actions=[action])
            sw.send_msg(mod)
        # else, send them up to aggregation switches
        match = sw.ofproto_parser.OFPMatch(dl_type=p_type)
        action = sw.ofproto_parser.OFPActionOutput(first_uplink + uplink_diff)
        uplink_diff = (uplink_diff + 1) % int(k / 2)
        mod = sw.ofproto_parser.OFPFlowMod(
            datapath=sw, match=match, cookie=0,
            command=ofproto.OFPFC_ADD, idle_timeout=0, hard_timeout=0,
            priority=1,
            flags=ofproto.OFPFF_SEND_FLOW_REM, actions=[action])
        sw.send_msg(mod)

    # set up links for agregation switches
    def setup_upper_aggr(self, sw, ofproto, k, swNum, p_type):
        first_uplink = int((k / 2) + 1)
        uplink_diff = 0
        k2 = int(k / 2)
        # if packet is going to this pod, send to correct Tor
        for tor in range(1, k2 + 1):
            pod = int(math.ceil(swNum / float(k2)))
            h_per_pod = ((k ** 2) / 4)
            start_host = int(1 + ((tor - 1) * (k / 2)) +
                             ((pod - 1) * h_per_pod))
            h_per_tor = k2
            for ip in range(start_host, start_host + h_per_tor):
                match = sw.ofproto_parser.OFPMatch(
                    dl_type=p_type, nw_dst=((10 << 24) + ip))
                action = sw.ofproto_parser.OFPActionOutput(tor)
                mod = sw.ofproto_parser.OFPFlowMod(
                    datapath=sw, match=match, cookie=0,
                    command=ofproto.OFPFC_ADD, idle_timeout=0, hard_timeout=0,
                    priority=2,
                    flags=ofproto.OFPFF_SEND_FLOW_REM, actions=[action])
                sw.send_msg(mod)
        # else, send packets up to core switches
        match = sw.ofproto_parser.OFPMatch(dl_type=p_type)
        action = sw.ofproto_parser.OFPActionOutput(first_uplink + uplink_diff)
        uplink_diff = (uplink_diff + 1) % int(k / 2)
        mod = sw.ofproto_parser.OFPFlowMod(
            datapath=sw, match=match, cookie=0,
            command=ofproto.OFPFC_ADD, idle_timeout=0, hard_timeout=0,
            priority=1,
            flags=ofproto.OFPFF_SEND_FLOW_REM, actions=[action])
        sw.send_msg(mod)

    def setup_core(self, sw, ofproto, k, swNum, p_type):
        for pod in range(1, k + 1):
            h_per_pod = int(((k ** 2) / float(4)))
            start_host = 1 + ((pod - 1) * h_per_pod)
            for ip in range(start_host, start_host + h_per_pod):
                match = sw.ofproto_parser.OFPMatch(
                    dl_type=p_type, nw_dst=((10 << 24) + ip))
                action = sw.ofproto_parser.OFPActionOutput(pod)
                mod = sw.ofproto_parser.OFPFlowMod(
                    datapath=sw, match=match, cookie=0,
                    command=ofproto.OFPFC_ADD, idle_timeout=0, hard_timeout=0,
                    priority=1,
                    flags=ofproto.OFPFF_SEND_FLOW_REM, actions=[action])
                sw.send_msg(mod)

    def prepareSwitch(self, sw):
        k = 4
        level = int(str(sw.id)[1])
        swNum = int(str(sw.id)[2:])
        ofproto = sw.ofproto

        if level == 1:
            self.setup_lower_aggr(sw, ofproto, k, swNum, 0x800)
            self.setup_lower_aggr(sw, ofproto, k, swNum, 0x806)
        elif level == 2:
            self.setup_upper_aggr(sw, ofproto, k, swNum, 0x800)
            self.setup_upper_aggr(sw, ofproto, k, swNum, 0x806)
        elif level == 3:
            self.setup_core(sw, ofproto, k, swNum, 0x800)
            self.setup_core(sw, ofproto, k, swNum, 0x806)
        else:
            raise Exception('switch must have level 1, 2, or 3')

    @set_ev_cls(dpset.EventDP)
    def switchStatus(self, ev):
        self.prepareSwitch(ev.dp)
