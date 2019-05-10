import subprocess
from functools import reduce
import re
import json
import time
from threading import Thread
import multiprocessing
import os
os.chdir('projectb-TovlyDeutsch') #TODO point this out in user guide

class Collector(Thread):
    def __init__(self, p, dump):
        Thread.__init__(self, daemon=True)
        self.p = p
        self.dump = dump

    # Body of the thread. Loop continuously every 0.1s (10ms).
    def run(self):
      while True:
        line = self.p.stdout.readline()
        self.dump.append(line)

aggPorts = range(1, 5)
basePorts = range(1, 3)
swNames = [f's42{num:02}' for num in range(1, 9)]

baseSwNames = [f's41{num:02}' for num in range(1, 9)]

aggrLinks = reduce(lambda acc, swName: acc +
               [f"{swName}-eth{link}"  for link in aggPorts], swNames, [])

baseLinks = reduce(lambda acc, swName: acc +
    [f"{swName}-eth{link}" for link in basePorts], baseSwNames, [])

links = aggrLinks + baseLinks

processes = [(subprocess.Popen(['sudo', 'tcpdump', '-i', link, '-U', '-tt', '-n', 'not',  'arp'],
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True, bufsize=1), link) for link in links]

dumps = [([], link) for (p, link) in processes]
# p = multiprocessing.Process(target=worker, args=(processes,))
# p.start()
listeners = [Collector(p, dumps[i][0]) for i, (p, link) in enumerate(processes)]
for listener in listeners:
    listener.start()

# time.sleep(20)
input("Press Enter to stop logging")


# p.terminate()
for (process, link) in processes:
  process.kill()

# for listener in listeners:
#   listener.flag = True

print("MADE IT HERE")
print(dumps[0][0])
os.chdir('..')
jsonOut = open("log.json", "w")
logList = []
print('opened json')

for (dump, link) in dumps:
    linkGrepped = re.search("s\d{1}(\d{1})(\d{2})-eth(\d)", link)
    level = linkGrepped.group(1)
    swName = linkGrepped.group(2)
    port = linkGrepped.group(3)

    # read
    for line in dump:
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
print('end of file')
    

"""
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on s4204-eth2, link-type EN10MB (Ethernet), capture size 262144 bytes
01:22:45.134239 IP6 mininet > ip6-allrouters: ICMP6, router solicitation, length 16
01:22:48.507189 IP6 mininet.mdns > ff02::fb.mdns: 0 [9q] PTR (QM)? _ipps._tcp.local. PTR (QM)? _ftp._tcp.local. PTR (QM)? _webdav._tcp.local. PTR (QM)? _webdavs._tcp.local. PTR (QM)? _sftp-ssh._tcp.local. PTR (QM)? _smb._tcp.local. PTR (QM)? _afpovertcp._tcp.local. PTR (QM)? _nfs._tcp.local. PTR (QM)? _ipp._tcp.local. (141)
01:22:48.729386 IP6 mininet.mdns > ff02::fb.mdns: 0 [9q] PTR (QM)? _ipps._tcp.local. PTR (QM)? _ftp._tcp.local. PTR (QM)? _webdav._tcp.local. PTR (QM)? _webdavs._tcp.local. PTR (QM)? _sftp-ssh._tcp.local. PTR (QM)? _smb._tcp.local. PTR (QM)? _afpovertcp._tcp.local. PTR (QM)? _nfs._tcp.local. PTR (QM)? _ipp._tcp.local. (141)
01:22:53.322102 IP6 mininet > ip6-allrouters: ICMP6, router solicitation, length 16
"""
