// io => 자동적으로 서버 측의 socket.io와 연결해주는 함수
const socket = io();

/*const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul.message_list");
const nicknameForm = document.querySelector("form.nickname_form");
const messageForm = document.querySelector("form.message_form");

function makeMessage(type, payload) {
  const message = {
    type,
    payload,
  };

  return JSON.stringify(message);
}

socket.addEventListener("open", () => console.log("Connected to Server ✅"));

socket.addEventListener("message", (message) => {
  const messageItem = document.createElement("li");
  messageItem.innerText = message.data;
  messageList.append(messageItem);
});

socket.addEventListener("close", () =>
  console.log("Disconnected from Server ❌")
);

nicknameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = nicknameForm.querySelector("input");

  socket.send(makeMessage("nickname", input.value));
  input.value = "";
  input.focus();
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = messageForm.querySelector("input");

  socket.send(makeMessage("new_message", input.value));
  input.value = "";
  input.focus();
});*/
