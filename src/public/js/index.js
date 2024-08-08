const socket = io();

const myCam = document.querySelector("video#my_cam");
const myControl = document.querySelector("div#my_control");
const myMuteButton = myControl.querySelector("button.mute");
const myCameraButton = myControl.querySelector("button.camera");

let myStream;
let isMuted = false;
let isCameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    myCam.srcObject = myStream;
  } catch (error) {
    console.log(error);
  }
}

myMuteButton.addEventListener("click", () => {
  if (isMuted) {
    isMuted = false;
    myMuteButton.innerText = "마이크 on";
  } else {
    isMuted = true;
    myMuteButton.innerText = "마이크 off";
  }
});

myCameraButton.addEventListener("click", () => {
  if (isCameraOff) {
    isCameraOff = false;
    myCameraButton.innerText = "카메라 on";
  } else {
    isCameraOff = true;
    myCameraButton.innerText = "카메라 off";
  }
});

getMedia();
