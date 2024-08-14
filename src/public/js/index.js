const socket = io();

const welcome = document.querySelector("div#welcome");
const welcomeForm = welcome.querySelector("form");
const roomName = document.querySelector("h2.roomName");
const call = document.querySelector("div#call");
const cameraSelect = document.querySelector("select#camera_select");

const myCam = document.querySelector("video#my_cam");
const myControl = document.querySelector("div#my_control");
const myMuteButton = myControl.querySelector("button.mute");
const myCameraButton = myControl.querySelector("button.camera");

const otherCam = document.querySelector("video#other_cam");

let myStream;
let myPeerConnection;
let isMuted = false;
let isCameraOff = false;

let otherStream;

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
    otherCam.srcObject = data.stream;
  });

  myStream
    .getTracks()
    .forEach((item) => myPeerConnection.addTrack(item, myStream));
}

async function initCall() {
  welcome.style.display = "none";
  call.style.display = "flex";

  await getMedia();
  makeConnection();
}

/* Socket handler */
socket.on("welcome", async () => {
  // offer => 다른 브라우저가 나의 room에 참가할 수 있도록 해주는 일종의 초대장
  const offer = await myPeerConnection.createOffer();

  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName.innerText);
});

socket.on("offer", async (offer) => {
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

/* DOM handler */
welcomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = welcomeForm.querySelector("input");

  await initCall();
  roomName.innerText = input.value;
  socket.emit("enter_room", input.value);
});

cameraSelect.addEventListener("input", async () => {
  await getMedia(cameraSelect.value);

  if (myPeerConnection) {
    const videoSender = myPeerConnection
      .getSenders()
      .filter((item) => item.track.kind === "video");
    const videoTrack = myStream.getVideoTracks()[0]; // 현재 선택 중인 카메라의 트랙 정보

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
