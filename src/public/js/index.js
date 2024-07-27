// 여기서의 socket은 서버로의 연결을 뜻함
const socket = new WebSocket(`ws://${window.location.host}`);

console.log(socket);
