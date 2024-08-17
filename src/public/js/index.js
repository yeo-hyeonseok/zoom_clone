const socket = io();

const welcome = document.querySelector("div#welcome");
const welcomeForm = welcome.querySelector("form");
const roomName = document.querySelector("h2.roomName");
const call = document.querySelector("div#call");
const exitButton = document.querySelector("button.exit_button");
const cameraSelect = document.querySelector("select#camera_select");

const myCam = document.querySelector("video#my_cam");
const myControl = document.querySelector("div#my_control");
const myMuteButton = myControl.querySelector("button.mute");
const myCameraButton = myControl.querySelector("button.camera");

const otherCam = document.querySelector("video#other_cam");
const otherControl = document.querySelector("div#other_control");
const otherMuteButton = otherControl.querySelector("button.mute");
const otherCameraButton = otherControl.querySelector("button.camera");

let myStream;
let myPeerConnection;
let isMuted = false;
let isCameraOff = false;

let otherStream;
let otherIsMuted = false;
let otherIsCameraOff = false;

let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((item) => item.kind === "videoinput");
    const currentCamera = myStream.getAudioTracks()[0];

    cameras.forEach((item) => {
      const option = document.createElement("option");

      option.value = item.deviceId;
      option.innerText = item.label;
      if (currentCamera.label === item.label) option.selected = true;

      cameraSelect.append(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  try {
    const initialConstraint = {
      video: { facingMode: "user" },
      audio: true,
    };

    // 해당 id의 카메라 디바이스만을 사용하도록 설정
    const cameraConstraint = {
      video: { facingMode: "user", deviceId: { exact: deviceId } },
      audio: true,
    };

    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraint : initialConstraint
    );

    myCam.srcObject = myStream;

    if (!deviceId) await getCameras();
  } catch (error) {
    console.log(error);
  }
}

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();

  myPeerConnection.addEventListener("icecandidate", (data) => {
    socket.emit("ice", data.candidate, roomName.innerText);
  });

  myPeerConnection.addEventListener("addstream", (data) => {
    otherStream = data.stream;
    otherCam.srcObject = data.stream;
  });

  myPeerConnection.addEventListener("connectionstatechange", (e) => {
    switch (myPeerConnection.connectionState) {
      case "disconnected":
        console.log("disconnected");
      case "failed":
        console.log("failed");
        break;
      case "connected":
        console.log("connected");
        break;
      case "closed":
        // 연결이 완전히 종료되었을 때
        console.log("closed");
        break;
      default:
        console.log("etc:", myPeerConnection.connectionState);
        break;
    }
  });

  myStream
    .getTracks()
    .forEach((item) => myPeerConnection.addTrack(item, myStream));
}

async function initCall() {
  welcome.style.display = "none";
  call.style.display = "block";

  await getMedia();
  makeConnection();
}

/* Socket handler */
socket.on("welcome", async () => {
  if (myPeerConnection.connectionState === "closed") makeConnection();

  // offer를 만드는 peer가 data channel을 만드는 주체임(peerA가 data channel을 만드는 곳)
  // 메시지 보내는 방법 => myDataChannel.send("hello")
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (e) =>
    console.log("peerB: ", e.data)
  );

  const offer = await myPeerConnection.createOffer();

  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName.innerText);
});

socket.on("offer", async (offer) => {
  // peer 연결에서 새로운 data channel이 생기면 새로운 data channel로 업데이트(peerB가 data channel을 만드는 곳)
  myPeerConnection.addEventListener("datachannel", (e) => {
    myDataChannel = e.channel;

    myDataChannel.addEventListener("message", (e) =>
      console.log("peerA: ", e.data)
    );
  });

  myPeerConnection.setRemoteDescription(offer);

  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);

  socket.emit("answer", answer, roomName.innerText);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

socket.on("exit", () => {
  myPeerConnection.close();
});

/* DOM handler */
welcomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = welcomeForm.querySelector("input");

  await initCall();
  roomName.innerText = input.value;
  socket.emit("enter_room", input.value);
  input.value = "";
});

exitButton.addEventListener("click", () => {
  myStream.getTracks().forEach((track) => track.stop());
  myPeerConnection.close();

  socket.emit("exit", roomName.innerText, () => {
    roomName.innerText = "";
    welcome.style.display = "block";
    call.style.display = "none";
  });
});

cameraSelect.addEventListener("input", async () => {
  await getMedia(cameraSelect.value);

  if (myPeerConnection) {
    const videoSender = myPeerConnection
      .getSenders()
      .filter((item) => item.track.kind === "video");
    const videoTrack = myStream.getVideoTracks()[0];

    videoSender.replaceTrack(videoTrack);
  }
});

myMuteButton.addEventListener("click", () => {
  myStream.getAudioTracks().forEach((item) => (item.enabled = !item.enabled));

  if (isMuted) {
    isMuted = false;
    myMuteButton.innerText = "마이크 on";
  } else {
    isMuted = true;
    myMuteButton.innerText = "마이크 off";
  }
});

myCameraButton.addEventListener("click", () => {
  myStream.getVideoTracks().forEach((item) => (item.enabled = !item.enabled));

  if (isCameraOff) {
    isCameraOff = false;
    myCameraButton.innerText = "카메라 on";
  } else {
    isCameraOff = true;
    myCameraButton.innerText = "카메라 off";
  }
});

otherMuteButton.addEventListener("click", () => {
  otherStream
    .getAudioTracks()
    .forEach((item) => (item.enabled = !item.enabled));

  if (otherIsMuted) {
    otherIsMuted = false;
    otherMuteButton.innerText = "마이크 on";
  } else {
    otherIsMuted = true;
    otherMuteButton.innerText = "마이크 off";
  }
});

otherCameraButton.addEventListener("click", () => {
  otherStream
    .getVideoTracks()
    .forEach((item) => (item.enabled = !item.enabled));

  if (otherIsCameraOff) {
    otherIsCameraOff = false;
    otherCameraButton.innerText = "카메라 on";
  } else {
    otherIsCameraOff = true;
    otherCameraButton.innerText = "카메라 off";
  }
});
