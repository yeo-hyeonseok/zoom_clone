const messageList = document.querySelector("ul.message_list");
const messageForm = document.querySelector("form.message_form");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => console.log("Connected to Server ✅"));

socket.addEventListener("message", (message) =>
  console.log(`Server: ${message.data}`)
);

socket.addEventListener("close", () =>
  console.log("Disconnected from Server ❌")
);

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = messageForm.querySelector("input");

  socket.send(input.value);
  input.value = "";
  input.focus();
});
