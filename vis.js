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

function trimJsonEnds(jsonLogs) {
  function findMaxDiff(x, i) {
    let minDiff = 60;
    let maxDiff = 5000;
    if (typeof jsonLogs[i + 1] != "undefined") {
      // console.log(jsonLogs[i + 1].timestamp, x.timestamp);
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
  console.log(startIndex, endIndex);
  return jsonLogs.slice(startIndex + 1, endIndex - 1);
}

let paused = true;
const playButton = document.querySelector("#play-pause");

let jsonLogs = null;
let nextLogIndex = 0;
let firstLogTime = null;
let lastLogTime = null;
let totalTimeRecorded = null;

document.getElementById("import").onclick = function() {
  let files = document.getElementById("selectFiles").files;
  // console.log(files);
  if (files.length <= 0) {
    return false;
  }

  let fr = new FileReader();

  fr.onload = function(e) {
    let result = JSON.parse(e.target.result);
    jsonLogs = trimJsonEnds(result);
    firstLogTime = jsonLogs[0].timestamp;
    lastLogTime = jsonLogs[jsonLogs.length - 1].timestamp;
    totalTimeRecorded = lastLogTime - firstLogTime;
    playButton.disabled = false;
    playButton.addEventListener("click", event => {
      paused = !paused;
      playButton.innerHTML = paused ? "Play" : "Pause";
      console.log("clicked");
    });
  };

  fr.readAsText(files.item(0));
};

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

// takes in tcpdump time stamp and converts it to absolute unix time
function toUnix(timestamp) {
  // "23:42:57.754229"
  timestamp.search(/(d+):(\d):(\d)\.(\d+)/);
  return new Date(timestamp);
}

let slowDown = 100;
let timelineVal = 0;
let animationStartTime = null;
let pausedTime = 0;

view.onFrame = function onFrame(event) {
  if (jsonLogs === null) {
    return;
  }
  // The total amount of time passed since
  // the first frame event in seconds:
  let time = event.time;
  let playedTime = time - pausedTime;
  let delta = event.delta; // The time passed in seconds since the last frame event
  let scaledTime = time / slowDown;
  let scaledPlayedTime = playedTime / slowDown;
  if (animationStartTime === null) {
    animationStartTime = time;
  }
  let scaledAnimationStart = animationStartTime / slowDown;
  if (paused) {
    pausedTime += delta;
    return;
  }

  // console.log(`first log time ${firstLogTime}`);
  // console.log(
  //   `timeFromFirstLog ${jsonLogs[nextLogIndex].timestamp - firstLogTime}`
  // );
  // console.log(`timestamp ${jsonLogs[nextLogIndex].timestamp}`);
  // console.log(`Scaled starttime ${scaledAnimationStart}`);
  // console.log(`Scaled time ${scaledTime}`);

  for (
    ;
    (jsonLogs[nextLogIndex].timestamp - firstLogTime + scaledAnimationStart <
      scaledPlayedTime ||
      nextLogIndex === 0) &&
    nextLogIndex < jsonLogs.length;
    nextLogIndex++
  ) {
    processLog(jsonLogs[nextLogIndex], delta, "thermal");
    // timeFromFirstLog = jsonLogs[nextLogIndex].timestamp - firstLogTime;
    // shouldContinue = timeFromFirstLog + scaledAnimationStart < scaledTime;
    // console.log(`first log time ${firstLogTime}`);
    // console.log(`next log index  in while${nextLogIndex}`);
    // console.log(`timestamp ${jsonLogs[nextLogIndex].timestamp}`);
    // console.log(
    //   jsonLogs[nextLogIndex].timestamp - firstLogTime,
    //   animationStartTime,
    //   scaledTime
    // );
  }
};
