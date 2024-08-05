const socket = io();

const serviceInfo = document.querySelector("ul#service_info");
const welcome = document.querySelector("div#welcome");
const nicknameForm = document.querySelector("form.nickname_form");
const roomForm = document.querySelector("form.room_form");
const room = document.querySelector("div#room");
const roomName = document.querySelector("h2.room_name");
const chat = document.querySelector("ul.chat_list");
const writeForm = document.querySelector("form.message_form");

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

socket.on("room_change", (num) => {
  const roomCount = document.querySelector("span.room_count");
  roomCount.innerText = num;
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
    const nickname = document.querySelector("span.username");
    nickname.innerText = inputValue;
  });
  input.value = "";
  input.focus();
});

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = roomForm.querySelector("input");

  socket.emit("enter_room", input.value, (name) => {
    roomName.innerText = name;

    welcome.style.display = "none";
    room.style.display = "block";
  });
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
