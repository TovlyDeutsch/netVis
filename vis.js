paper.install(window);
paper.setup("myCanvas");

let startHeight = 400;
let hostSize = 20;
let hostGap = 30;
let switchSize = 50;
let layer1Gap = 100;
let layer2Gap = 100;
let layer3Gap = 150;

let hosts = [];
let swBase = [];
let swAgg = [];
let swCore = [];
let linkH = [];
let linkA = [];

let startingSwitchHeat = 0;
let startingSwitchCongestion = 0;

let startLinkHeat = 10000;

function getHeightSwX(i) {
  return hostSize + hostGap * 0.5 + 50 + 2 * i * (hostSize + hostGap);
}

function getHeightSwXL(i) {
  return getHeightSwX(i) - 0.5 * switchSize;
}

function getHeightSwXR(i) {
  return getHeightSwX(i) + 0.5 * switchSize;
}

function getHostMid(i) {
  return 50 + i * (hostSize + hostGap) + hostSize * 0.5;
}

function getLinkIndex(sw, port) {
  if (port <= 2) {
    return sw * 2 - 3 + port;
  } else {
    return (
      16 +
      (8 * ((sw + 1) % 2) +
        4 * ((port + 1) % 2) +
        (sw - 1 - ((sw - 1) % 2)) / 2)
    );
  }
}

function getSwitches(sw, port) {}

for (let i = 0; i < 16; i++) {
  let baseHost = new Path.Rectangle(
    new Point(50 + i * (hostSize + hostGap), startHeight),
    new Size(hostSize, hostSize)
  );
  baseHost.style = {
    fillColor: "white",
    strokeColor: "black"
  };
  hosts.push(baseHost);
  let rectangle = new Rectangle(
    new Point(50 + i * (hostSize + hostGap), startHeight),
    new Point(50 + i * (hostSize + hostGap) + hostSize, startHeight + hostSize)
  );
  let path = new Path.Rectangle(rectangle);
  path.strokeColor = "black";
  hosts.push(path);

  var text = new PointText(
    new Point(
      50 + i * (hostSize + hostGap) + hostSize / 2,
      startHeight + hostSize / 2 + 5
    )
  );
  text.justification = "center";
  text.content = i + 1;
}

//base switches
for (let i = 0; i < 8; i++) {
  let rectangle = new Rectangle(
    new Point(getHeightSwXL(i), startHeight - layer1Gap),
    new Point(getHeightSwXR(i), startHeight - layer1Gap + switchSize)
  );
  let path = new Path.Rectangle(rectangle);
  path.strokeColor = "black";
  path.data.heat = startingSwitchHeat;
  path.data.lastPacketTime = 0;
  path.data.congestion = startingSwitchCongestion;
  let swNum = i + 1;
  path.data.links = [
    getLinkIndex(swNum, 2 - (swNum % 2)),
    getLinkIndex(swNum + 2 * (swNum % 2) - 1, 2 - (swNum % 2))
  ];
  console.log(`swNum: ${swNum}, level: aggr, indexes: ${path.data.links}`);

  swBase.push(path);

  var text = new PointText(
    new Point(
      getHeightSwXL(i) + switchSize / 2,
      startHeight - layer1Gap + switchSize / 2 + 5
    )
  );
  text.justification = "center";
  text.content = "S410" + (i + 1);
}

//aggregate switches
for (let i = 0; i < 8; i++) {
  let rectangle = new Rectangle(
    new Point(getHeightSwXL(i), startHeight - layer1Gap - layer2Gap),
    new Point(
      getHeightSwXR(i),
      startHeight - layer1Gap - layer2Gap + switchSize
    )
  );
  let path = new Path.Rectangle(rectangle);
  path.strokeColor = "black";
  path.data.heat = startingSwitchHeat;
  path.data.lastPacketTime = 0;

  path.data.congestion = startingSwitchCongestion;
  let swNum = i + 1;
  path.data.links = [
    getLinkIndex(swNum, 1),
    getLinkIndex(swNum, 2),
    getLinkIndex(swNum, 3),
    getLinkIndex(swNum, 4)
  ];
  console.log(`swNum: ${swNum}, level: aggr, indexes: ${path.data.links}`);

  swAgg.push(path);

  var text = new PointText(
    new Point(
      getHeightSwXL(i) + switchSize / 2,
      startHeight - layer1Gap - layer2Gap + switchSize / 2 + 5
    )
  );
  text.justification = "center";
  text.content = "S420" + (i + 1);
}

//core switches
for (let i = 0; i < 4; i++) {
  let rectangle = new Rectangle(
    new Point(
      0.5 * getHeightSwXL(2 * i) + 0.5 * getHeightSwXL(2 * i + 1),
      startHeight - layer1Gap - layer2Gap - layer3Gap
    ),
    new Point(
      0.5 * getHeightSwXR(2 * i) + 0.5 * getHeightSwXR(2 * i + 1),
      startHeight - layer1Gap - layer2Gap - layer3Gap + switchSize
    )
  );
  let path = new Path.Rectangle(rectangle);
  path.strokeColor = "black";
  swCore.push(path);
  path.data.heat = startingSwitchHeat;
  path.data.lastPacketTime = 0;
  path.data.congestion = startingSwitchCongestion;

  let swNum = i + 1;
  path.data.links = [
    getLinkIndex(1 + Math.floor(i / 2), 4 - (swNum % 2)),
    getLinkIndex(3 + Math.floor(i / 2), 4 - (swNum % 2)),
    getLinkIndex(5 + Math.floor(i / 2), 4 - (swNum % 2)),
    getLinkIndex(7 + Math.floor(i / 2), 4 - (swNum % 2))
  ];
  console.log(`swNum: ${swNum}, level: core, indexes: ${path.data.links}`);

  var text = new PointText(
    new Point(
      0.5 * getHeightSwXR(2 * i) +
        0.5 * getHeightSwXR(2 * i + 1) -
        switchSize / 2,
      startHeight - layer1Gap - layer2Gap - layer3Gap + switchSize / 2 + 5
    )
  );
  text.justification = "center";
  text.content = "S430" + (i + 1);
}

//host-base links
for (let i = 0; i < 16; i++) {
  let j = (i - (i % 2)) / 2;
  let path = new Path();
  path.strokeColor = "black";
  path.moveTo(new Point(getHostMid(i), startHeight));
  path.lineTo(new Point(getHeightSwX(j), startHeight - layer1Gap + switchSize));
  linkH.push(path);
}

//agg-base links
for (let i = 0; i < 4; i++) {
  let path = new Path();
  path.strokeColor = "black";
  path.data.heat = startLinkHeat;
  path.data.lastPacketTime = 0;
  path.data.workingHeat = startLinkHeat;
  path.moveTo(new Point(getHeightSwX(2 * i), startHeight - layer1Gap));
  path.lineTo(
    new Point(
      getHeightSwX(2 * i),
      startHeight - layer1Gap - layer2Gap + switchSize
    )
  );
  linkA.push(path);
  path = new Path();
  path.strokeColor = "black";
  path.data.heat = startLinkHeat;
  path.data.lastPacketTime = 0;
  path.data.workingHeat = startingSwitchHeat;
  path.moveTo(new Point(getHeightSwX(2 * i + 1), startHeight - layer1Gap));
  path.lineTo(
    new Point(
      getHeightSwX(2 * i),
      startHeight - layer1Gap - layer2Gap + switchSize
    )
  );
  linkA.push(path);
  path = new Path();
  path.strokeColor = "black";
  path.data.heat = 10000;
  path.data.lastPacketTime = 0;
  path.data.workingHeat = 10000;
  path.moveTo(new Point(getHeightSwX(2 * i), startHeight - layer1Gap));
  path.lineTo(
    new Point(
      getHeightSwX(2 * i + 1),
      startHeight - layer1Gap - layer2Gap + switchSize
    )
  );
  linkA.push(path);
  path = new Path();
  path.strokeColor = "black";
  path.data.heat = 10000;
  path.data.lastPacketTime = 0;
  path.data.workingHeat = 10000;
  path.moveTo(new Point(getHeightSwX(2 * i + 1), startHeight - layer1Gap));
  path.lineTo(
    new Point(
      getHeightSwX(2 * i + 1),
      startHeight - layer1Gap - layer2Gap + switchSize
    )
  );
  linkA.push(path);
}

//agg-core links
for (let i = 0; i < 4; i++) {
  let j = (i - (i % 2)) / 2;
  for (let k = 0; k < 8; k += 2) {
    let path = new Path();
    path.strokeColor = "black";
    path.data.heat = 10000;
    path.data.lastPacketTime = 0;
    path.data.workingHeat = 10000;
    path.moveTo(
      new Point(
        getHeightSwX(2 * i) * 0.5 + getHeightSwX(2 * i + 1) * 0.5,
        startHeight - layer1Gap - layer2Gap - layer3Gap + switchSize
      )
    );
    path.lineTo(
      new Point(getHeightSwX(j + k), startHeight - layer1Gap - layer2Gap)
    );
    linkA.push(path);
  }
}

function setLinksToBlack() {
  for (let linkPath of linkA.concat(linkH)) {
    linkPath.data.heat = 10000;
    linkPath.strokeColor = "black";
  }
}

function trimJsonEnds(jsonLogs) {
  function findMaxDiff(x, i) {
    let minDiff = 60;
    let maxDiff = 5000;
    if (typeof jsonLogs[i + 1] != "undefined") {
      let diff = Math.abs(jsonLogs[i + 1].timestamp - x.timestamp);
      return diff > minDiff && diff < maxDiff;
    } else {
      false;
    }
  }
  let startIndex = jsonLogs.findIndex(findMaxDiff);
  let endIndex =
    jsonLogs.length -
    1 -
    jsonLogs
      .slice()
      .reverse()
      .findIndex(findMaxDiff);
  // console.log(startIndex, endIndex);
  return jsonLogs.slice(startIndex + 1, endIndex - 1);
}

let jsonLogs = null;
let nextLogIndex = 0;
let firstLogTime = null;
let lastLogTime = null;
let totalTimeRecorded = null;
let animationStartTime = null;
let slowDown = 1;
let fadeAdjustment = 1; // TODO maybe make this user adjustable
let fadeFactor = fadeAdjustment / slowDown;
let currentTime = 0;
let beta = 0.8;

let paused = true;
const playButton = document.querySelector("#play-pause");
const restartButton = document.querySelector("#restart");
const statusText = document.querySelector("#status");
const speedSlider = document.querySelector("#speed");
const speedLabel = document.querySelector("#speed-label");
slowDown = parseInt(speedSlider.value);
fadeFactor = 1 / slowDown;
speedLabel.innerHTML =
  slowDown == 1
    ? "Real time"
    : "<b>" + slowDown + "x</b> slower than real time";

speedSlider.addEventListener("input", () => {
  slowDown = event.target.value;
  speedLabel.innerHTML =
    slowDown == 1
      ? "Real time"
      : "<b>" + slowDown + "x</b> slower than real time";
});

document.querySelector("#selectFiles").addEventListener("change", () => {
  // let files = document.getElementById("selectFiles").files;
  let files = event.target.files;
  if (files.length <= 0) {
    return false;
  }

  statusText.innerText = "Loading JSON...";

  let fr = new FileReader();

  fr.onload = function(e) {
    statusText.innerText = "Processing JSON...";
    let result = JSON.parse(e.target.result);
    jsonLogs = trimJsonEnds(result);
    firstLogTime = jsonLogs[0].timestamp;
    lastLogTime = jsonLogs[jsonLogs.length - 1].timestamp;
    totalTimeRecorded = lastLogTime - firstLogTime;
    playButton.addEventListener("click", event => {
      paused = !paused;
      statusText.innerText = paused ? "Paused" : "Playing Animation";
      playButton.innerHTML = paused ? "Play" : "Pause";
    });
    restartButton.addEventListener("click", event => {
      animationStartTime = null;
      nextLogIndex = 0;
      currentTime = 0;
      setLinksToBlack();
    });
    playButton.disabled = false;
    restartButton.disabled = false;
    statusText.innerText = "JSON processed, ready to play animation!";
  };

  fr.readAsText(files.item(0));
});

// TODO extract lenth and ip's from log
let bytesPerPacket = 64; // Assumption
let bitsPerpacket = bytesPerPacket * 8;
let maxCapacityMb = 1e7; // 10Mb
let maxHeat = maxCapacityMb / bitsPerpacket;

let linksToUpdate = new Set();
let swToUpdate = new Set();
let allSw = swAgg.concat(swBase).concat(swCore);

function heatToCongestion() {
  for (let swPath of allSw) {
    let total = 0;
    for (let linkIndex of swPath.data.links) {
      let linkPath = linkA[linkIndex];
      linkPath.data.heat *= 1 + fadeFactor;
      let congestion = bitsPerpacket / maxCapacityMb / linkPath.data.heat;
      total += congestion;
      linkPath.strokeColor = new Color(congestion, 1 - congestion, 0);
    }
    let switchCongestion = total / 4;
    swPath.strokeColor = new Color(switchCongestion, 1 - switchCongestion, 0);
  }
}

// takes in an aggr switch num and port number and returns corresponding sw
function linkToSwitch(swNum, port) {
  let level = port < 3 ? 1 : 3;
  // console.log(swNum, port);
  if (swNum % 2 === 1) {
    if (level === 3) {
      return { level: level, swNum: port - 2 };
    } else {
      return { level: level, swNum: swNum + port - 1 };
    }
  } else {
    if (level === 3) {
      return { level: level, swNum: port };
    } else {
      return { level: level, swNum: swNum + port - 2 };
    }
  }
}

function processLog(log, delta, mode) {
  switch (mode) {
    case "thermal":
      let swNum = parseInt(log.swName);
      let port = parseInt(log.port);
      let linkIndex = getLinkIndex(swNum, port);
      let linkPath = linkA[linkIndex];
      if (!linkPath.data.lastPacketTime) {
        linkPath.data.lastPacketTime = log.timestamp;
        break;
      }
      let packetDelta = log.timestamp - linkPath.data.lastPacketTime;
      linkPath.data.lastPacketTime = log.timestamp;
      linkPath.data.workingHeat =
        beta * packetDelta + (1 - beta) * linkPath.data.workingHeat;
      linkPath.data.heat = linkPath.data.workingHeat;
      break;
  }
}

view.onFrame = function onFrame(event) {
  if (jsonLogs === null || paused) {
    return;
  }
  let delta = event.delta; // The time passed in seconds since the last frame event
  let scaledDelta = delta / slowDown;
  currentTime += scaledDelta;
  // console.log(`current time ${currentTime}`);

  for (
    ;
    (jsonLogs[nextLogIndex].timestamp - firstLogTime < currentTime ||
      nextLogIndex === 0) &&
    nextLogIndex < jsonLogs.length;
    nextLogIndex++
  ) {
    processLog(jsonLogs[nextLogIndex], scaledDelta, "thermal");
    heatToCongestion();
  }
};
