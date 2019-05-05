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
}

//base switches
for (let i = 0; i < 8; i++) {
  let rectangle = new Rectangle(
    new Point(getHeightSwXL(i), startHeight - layer1Gap),
    new Point(getHeightSwXR(i), startHeight - layer1Gap + switchSize)
  );
  let path = new Path.Rectangle(rectangle);
  path.strokeColor = "black";
  swBase.push(path);
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
  swAgg.push(path);
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
  path.data.heat = 10000;
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
  path.data.heat = 10000;
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
  for (linkPath of linkA.concat(linkH)) {
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

let paused = true;
const playButton = document.querySelector("#play-pause");
const restartButton = document.querySelector("#restart");
const statusText = document.querySelector("#status");
const speedSlider = document.querySelector("#speed");
const speedLabel = document.querySelector("#speed-label");

let jsonLogs = null;
let nextLogIndex = 0;
let firstLogTime = null;
let lastLogTime = null;
let totalTimeRecorded = null;
let animationStartTime = null;
let slowDown = 1;
let currentTime = 0;

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
      // decay factor
      let beta = 0.2;
      linkPath.data.heat = beta * packetDelta + (1 - beta) * linkPath.data.heat;
      let totalBits = linkPath.data.heat * bitsPerpacket;
      let congestion = bitsPerpacket / maxCapacityMb / linkPath.data.heat;
      if (congestion > 1) {
        // console.log(congestion);
      }
      linkPath.strokeColor = new Color(congestion, 1 - congestion, 0);
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
  }
};
