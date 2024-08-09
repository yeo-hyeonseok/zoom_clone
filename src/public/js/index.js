const socket = io();

const cametaSelect = document.querySelector("select#camera_select");
const myCam = document.querySelector("video#my_cam");
const myControl = document.querySelector("div#my_control");
const myMuteButton = myControl.querySelector("button.mute");
const myCameraButton = myControl.querySelector("button.camera");

let myStream;
let isMuted = false;
let isCameraOff = false;

async function getCameras() {
  try {
    // 유저에게 연결된 모든 디바이스들의 정보를 불러오는 거임
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((item) => item.kind === "videoinput");

    cameras.forEach((item) => {
      const option = document.createElement("option");

      option.value = item.deviceId;
      option.innerText = item.label;
      cametaSelect.append(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    myCam.srcObject = myStream;
    getCameras();
  } catch (error) {
    console.log(error);
  }
}

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

getMedia();
