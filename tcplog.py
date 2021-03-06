import subprocess
from functools import reduce
import re
import json

"""
pidToLink = {
  pid => indx in `processes`
}
"""

f = open("test.txt", "w")

aggPorts = range(1, 5)
basePorts = range(1, 3)
swNames = [f's42{num:02}' for num in range(1, 9)]

baseSwNames = [f's41{num:02}' for num in range(1, 9)]

aggrLinks = reduce(lambda acc, swName: acc +
                   [f"{swName}-eth{link}" for link in aggPorts], swNames, [])

baseLinks = reduce(lambda acc, swName: acc +
                   [f"{swName}-eth{link}" for link in basePorts], baseSwNames, [])

links = aggrLinks + baseLinks

for link in links:
    print(link)

fileAndLinks = [(open(f"Logs/{link}.txt", "w+"), link) for link in links]

# sudoPassword = 'mininet'
# command = 'mount -t vboxsf myfolder /home/mininet/netVis'
# p = os.system('echo %s|sudo -S %s' % (sudoPassword, command))

processes = [subprocess.Popen(['sudo', 'tcpdump', '-i', link, '-tt', '-n', 'not',  'arp'],
                              stdout=fileObj,
                              stderr=subprocess.STDOUT) for (fileObj, link) in fileAndLinks]

input("Press Enter to stop logging")
for process in processes:
    process.kill()

jsonOut = open("log.json", "w")
logList = []
for (fileObj, link) in fileAndLinks:
    fileObj.seek(0)
    linkGrepped = re.search("s\d{1}(\d{1})(\d{2})-eth(\d)", link)
    level = linkGrepped.group(1)
    swName = linkGrepped.group(2)
    port = linkGrepped.group(3)

    # read
    for line in fileObj:
        # print(line)
        # regex
        greppedLine = re.search("^(\d+\.\d+) IP ", line)
        if not greppedLine:
            continue

        obj = {
            'swName': swName,
            "port": port,
            'level': level,
            "timestamp": float(greppedLine.group(1))
        }
        logList.append(obj)

logList.sort(key=lambda x: x["timestamp"])
json.dump(logList, jsonOut)


"""
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on s4204-eth2, link-type EN10MB (Ethernet), capture size 262144 bytes
01:22:45.134239 IP6 mininet > ip6-allrouters: ICMP6, router solicitation, length 16
01:22:48.507189 IP6 mininet.mdns > ff02::fb.mdns: 0 [9q] PTR (QM)? _ipps._tcp.local. PTR (QM)? _ftp._tcp.local. PTR (QM)? _webdav._tcp.local. PTR (QM)? _webdavs._tcp.local. PTR (QM)? _sftp-ssh._tcp.local. PTR (QM)? _smb._tcp.local. PTR (QM)? _afpovertcp._tcp.local. PTR (QM)? _nfs._tcp.local. PTR (QM)? _ipp._tcp.local. (141)
01:22:48.729386 IP6 mininet.mdns > ff02::fb.mdns: 0 [9q] PTR (QM)? _ipps._tcp.local. PTR (QM)? _ftp._tcp.local. PTR (QM)? _webdav._tcp.local. PTR (QM)? _webdavs._tcp.local. PTR (QM)? _sftp-ssh._tcp.local. PTR (QM)? _smb._tcp.local. PTR (QM)? _afpovertcp._tcp.local. PTR (QM)? _nfs._tcp.local. PTR (QM)? _ipp._tcp.local. (141)
01:22:53.322102 IP6 mininet > ip6-allrouters: ICMP6, router solicitation, length 16
"""
