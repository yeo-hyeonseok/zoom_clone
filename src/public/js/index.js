// io => 자동적으로 서버 측의 socket.io와 연결해주는 함수
const socket = io();

const welcome = document.querySelector("div#welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.querySelector("div#room");
const chat = room.querySelector("ul");

function onEnterRoom(roomName) {
  const h2 = room.querySelector("h2.room_name");
  h2.innerText = roomName;

  welcome.style.display = "none";
  room.style.display = "block";
}

function addMessage(text) {
  const li = document.createElement("li");

  li.innerText = text;
  chat.append(li);
}

socket.on("welcome", () => {
  addMessage("누군가가 채팅방에 들어왔습니다.");
});

welcomeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = welcomeForm.querySelector("input");

  socket.emit("enter_room", input.value, onEnterRoom);
  input.value = "";
  input.focus();
});
