const socket = io();

const welcome = document.querySelector("div#welcome");
const welcomeForm = welcome.querySelector("form");
const call = document.querySelector("div#call");
const cameraSelect = document.querySelector("select#camera_select");
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
    // 현재 어떤 카메라가 선택되었는지 확인할 수 있음
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

socket.on("welcome", () => {
  console.log("ㅎㅇ 누가 방에 참여함");
});

welcomeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = welcomeForm.querySelector("input");

  socket.emit("enter_room", input.value, () => {
    getMedia();

    welcome.style.display = "none";
    call.style.display = "flex";
  });
});

cameraSelect.addEventListener("input", async () => {
  await getMedia(cameraSelect.value);
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
