// io => 자동적으로 서버 측의 socket.io와 연결해주는 함수
const socket = io();

const welcome = document.querySelector("div#welcome");
const roomForm = welcome.querySelector("form");

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = roomForm.querySelector("input");

  socket.emit("enter_room", { payload: input.value }, (msg) => {
    console.log(`${msg}(서버에서 호출됐지만, 클라이언트에서 실행됨)`);
  });
  input.value = "";
  input.focus();
});
