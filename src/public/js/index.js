// 여기서의 socket은 서버로의 연결을 뜻함
const socket = new WebSocket(`ws://${window.location.host}`);

// 서버와의 연결이 성공적으로 이루어졌을 때의 이벤트 핸들러
socket.addEventListener("open", () => console.log("Connected to Server ✅"));

// 서버로부터 메시지를 받았을 때의 이벤트 핸들러
socket.addEventListener("message", (message) =>
  console.log(`Server: ${message.data}`)
);

// 서버와 연결이 종료되었을 때의 이벤트 핸들러
socket.addEventListener("close", () =>
  console.log("Disconnected from Server ❌")
);

setTimeout(() => {
  socket.send("어 그래 반갑다");
}, 5000);
