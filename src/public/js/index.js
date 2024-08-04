const socket = io();

const welcome = document.querySelector("div#welcome");
const nickname = document.querySelector("p.nickname");
const nicknameForm = document.querySelector("form.nickname_form");
const roomForm = document.querySelector("form.room_form");
const roomName = document.querySelector("h2.room_name");
const room = document.querySelector("div#room");
const writeForm = document.querySelector("form.message_form");
const chat = document.querySelector("ul.chat_list");

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

/* from server */
socket.on("welcome", (nickname) => {
  addMessage(`${nickname}님이 채팅방에 들어왔습니다.`);
});

socket.on("new_message", (nickname, msg) => {
  addMessage(`${nickname}: ${msg}`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname}님이 채팅방을 나갔습니다.`);
});

/* to server */
nicknameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = nicknameForm.querySelector("input");
  const inputValue = input.value;

  socket.emit("nickname", inputValue, () => {
    nickname.innerText = inputValue;
  });
  input.value = "";
  input.focus();
});

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = roomForm.querySelector("input");

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
