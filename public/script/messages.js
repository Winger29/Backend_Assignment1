const apibase2 = "http://localhost:3000";
const token2 = localStorage.getItem('token');
let currentRoomName = null;
let userID = null; // Set this from your JWT or login data
const socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem('token')
  }
});




function sendMessage() {
    const input = document.getElementById('messageInput');
    console.log(input);
    const messageText = input.value.trim();
  
    if (!messageText) return;
  
    const messageData = {
      groupName: currentRoomName, // store current group name globally when you join a room
      senderId: userID,           // your global user ID
      content: messageText,
      timestamp: new Date().toISOString()
    };
  
    // 1. Emit to socket
    socket.emit('chatMessage', messageData);
  
    // 3. Clear input
    input.value = '';
  }


  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('createGroupBtn').addEventListener('click', sendMessage);
  });
  
  