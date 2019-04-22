from mininet.topo import Topo


class FatTopo(Topo):
    def __init__(self, k):
        Topo.__init__(self)

        num_hosts = (k ** 3) / 4
        hosts = [hostId for hostId in range(1, num_hosts + 1)]

        self.hosts_ = [
            self.addHost('h%d' % hostId, ip='10.0.0.%d' %
                         hostId, intf='server-eth0')
            for hostId in range(1, num_hosts + 1)]

        aggr_count = (k ** 2) / 2
        core_count = (k / 2) ** 2

        # the naming scheme for switches is s[k][level][2 digit switch ID] where level is 1 for edge switches
        edge_switches = [(switchId, "s%d1%02d" % (k, switchId))
                         for switchId in range(1, aggr_count + 1)]
        aggregation_switches = [(switchId, "s%d2%02d" % (4, switchId))
                                for switchId in range(1, aggr_count + 1)]
        core_switches = [(switchId, "s%d3%02d" % (k, switchId), 1)
                         for switchId in range(1, core_count + 1)]
        all_sws = edge_switches + aggregation_switches + core_switches

        self.switches_ = [
            self.addSwitch(sw[1], protocols='OpenFlow10')
            for sw in all_sws]

        self.hostLinks_ = []
        # connect hosts to edge switches (ToRs)
        for sw in edge_switches:
            # first k / 2 ports of an edge switch will be to hosts
            # for edge switch x, port y will connect to host host (x - 1) * (k / 2) + y
            for _ in range(int(k / 2)):
                self.hostLinks_.append(
                    self.addLink('h%d' % hosts.pop(0), sw[1]))

        self.switchLinks_ = []
        # connect edge switches to aggregation switches
        for l_aggr_sw in edge_switches:
            first_switch_above = int(
                l_aggr_sw[0] - ((l_aggr_sw[0] - 1) % (k / 2)))
            # second k / 2 ports of an edge switch will be to aggregation switches
            # first k / 2 ports of an aggregation switch will be connected to an edge switch
            # for first k / 2 ports of an aggregation swtich x,
            # port a will connect to an edge switch that has hosts (k / 2) * (podnum - 1) + a * (k / 2)
            for u_aggr_sw_num in range(first_switch_above, first_switch_above + int(k / 2)):
                self.switchLinks_.append(self.addLink(
                    l_aggr_sw[1], aggregation_switches[u_aggr_sw_num - 1][1]))

        # connect aggregation swithces to core switches
        pod = 0
        for u_aggr_switch in aggregation_switches:
            if u_aggr_switch[0] % int(k / 2) == 1:
                pod += 1
            first_usw_in_pod = (pod - 1) * int(k / 2) + 1
            pos_in_pod = u_aggr_switch[0] - first_usw_in_pod
            core_pos = pos_in_pod * int(k / 2)
            for _ in range(int(k / 2) + 1, k + 1):
                # port a on core switch connects to pod a which has hosts 1 + (a - 1) * (k / 2) through a * (k / 2) inclusive
                core_switches[core_pos] = (
                    core_switches[core_pos][0], core_switches[core_pos][1], core_switches[core_pos][2] + 1)
                self.switchLinks_.append(self.addLink(
                    u_aggr_switch[1], core_switches[core_pos][1]))
                core_pos = (core_pos + 1) % ((k ** 2) / 4)

    @classmethod
    def create(cls, count):
        return cls(count)


topos = {'fat_topo': FatTopo.create}
