// io => 자동적으로 서버 측의 socket.io와 연결해주는 함수
const socket = io();

const welcome = document.querySelector("div#welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.querySelector("div#room");
const roomName = room.querySelector("h2.room_name");
const writeForm = room.querySelector("form");
const chat = room.querySelector("ul");

function onEnterRoom(name) {
  roomName.innerText = name;

  welcome.style.display = "none";
  room.style.display = "block";
}

function addMessage(msg) {
  const li = document.createElement("li");

  li.innerText = msg;
  chat.append(li);

  const scrollHeight = chat.scrollHeight;
  chat.scrollTo(0, scrollHeight);
}

socket.on("welcome", () => {
  addMessage("누군가가 채팅방에 들어왔습니다.");
});

socket.on("new_message", (msg) => {
  addMessage(`상대: ${msg}`);
});

socket.on("bye", () => {
  addMessage("누군가가 채팅방을 나갔습니다.");
});

welcomeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = welcomeForm.querySelector("input");

  socket.emit("enter_room", input.value, onEnterRoom);
  input.value = "";
  input.focus();
});

writeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = writeForm.querySelector("input");

  socket.emit("new_message", roomName.innerText, input.value, addMessage);
  input.value = "";
  input.focus();
});
