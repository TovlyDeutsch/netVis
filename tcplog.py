import subprocess
from functools import reduce

"""
pidToLink = {
  pid => indx in `processes`
}
"""

# stdout, stderr = MyOut.communicate()

f = open("test.txt", "w")

aggPorts = range(1, 5)
swNames = [f's42{num:02}' for num in range(1, 9)]

links = reduce(lambda acc, swName: acc +
               [f"{swName}-eth{link}" for link in aggPorts], swNames, [])

for link in links:
    print(link)

fileAndLinks = [(open(f"{link}.txt", "w"), link) for link in links]

# sudoPassword = 'mininet'
# command = 'mount -t vboxsf myfolder /home/mininet/netVis'
# p = os.system('echo %s|sudo -S %s' % (sudoPassword, command))

processes = [subprocess.Popen(['sudo', 'tcpdump', '-i', link],
                              stdout=fileObj,
                              stderr=subprocess.STDOUT) for (fileObj, link) in fileAndLinks]

for process in processes:
  process.wait()
