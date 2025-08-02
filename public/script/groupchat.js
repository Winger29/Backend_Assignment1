const apibase = "http://localhost:3000";
const token = localStorage.getItem('token')
const grouplist = document.getElementById("custom-group-list");
const mainwrapper = document.getElementById("main-wrapper");
const chatOptionsBtn = document.getElementById('chatOptionsBtn');
const chatDropdownMenu = document.getElementById('chatDropdownMenu');
const socket = io('http://localhost:3000');
let userID = "";
let userName = ""; 

if (token) {
    try{ 
        const split = JSON.parse(atob(token.split('.')[1]));
        userID = split.id;
        userName = split.Name || split.name;
        } catch(e) {
            console.error("Invalid token, check if its correct")
        }
} 
else {
    console.log("No token found")
}


// Function to handle incoming messages for real time 
socket.on('newMessage', (data) => {
  if (data.senderid === userID) return; 

  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('chat-message', 'received');

  msgDiv.innerHTML = `
    <div class="message-user">${data.sender}</div>
    <div class="message-text">${data.message}</div>
    <div class="message-time">${new Date(data.msgTime).toLocaleTimeString()}</div>
  `;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

socket.on("messageDeleted", ({ messageId }) => {
  const msgDiv = document.querySelector(`.chat-message[data-message-id="${messageId}"]`);
  if (msgDiv) {
    msgDiv.innerHTML = `<div class="message-text deleted-text">This message has been deleted</div>`;
    msgDiv.classList.add("deleted-message");
  }
});



async function searchGroupByName(name) {
  try {
    const response = await fetch(`${apibase}/groupchat/${encodeURIComponent(name)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Group API result:", result);
      return result || null; 
    } else {
      console.warn("API responded with", response.status);
      return null;
    }
  } catch (err) {
    console.error("Error fetching group by name:", err);
    return null;
  }
}

// loads all the messages form oldest to newest and also checks if the messages are from the user or not 
async function loadMessagesForGroup(name) {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = ""; 

  const search = await searchGroupByName(name); 

  if (!search || !search.groupID) {
    console.error("Group not found or groupID is undefined");
    return;
  }

  console.log("Group ID:", search.groupID); 

  try {
    const response = await fetch(`${apibase}/messages/${search.groupID}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-type": "application/json"
      }
    });


    if (!response.ok) {
      console.log("Failed to fetch messages:", response.status);
      throw new Error("Failed to fetch messages");
    }

    const messages = await response.json();

    const latest = messages[messages.length - 1]?.message || 'No messages yet.';


    if (!messages || messages.length === 0) {
      chatMessages.innerHTML = '<p class="no-messages">No messages in this group yet.</p>';
      return;
    }
    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      const isSentByUser = String(msg.seniorId) === String(userID);
      msgDiv.className = `chat-message ${isSentByUser ? 'sent' : 'received'}`;
      msgDiv.dataset.messageId = msg.msgid;
    
      const userDiv = document.createElement('div');
      userDiv.className = 'message-user';
      userDiv.textContent = isSentByUser ? 'You' : msg.fullName;
      msgDiv.appendChild(userDiv);
    
      const textDiv = document.createElement('div');
      textDiv.className = 'message-text';
      textDiv.textContent = msg.message;
      msgDiv.appendChild(textDiv);
          
      const timeDiv = document.createElement('div');
      timeDiv.className = 'message-time';
      timeDiv.textContent = new Date(msg.msgtime).toLocaleString();
      msgDiv.appendChild(timeDiv);
    
      // Dropdown menu (only for user's own message)
      if (isSentByUser) {
        const optionsBtn = document.createElement('button');
        optionsBtn.className = 'options-button';
        optionsBtn.innerHTML = '⋮'; 
        msgDiv.appendChild(optionsBtn);
    
        const menu = document.createElement('div');
        menu.className = 'options-menu hidden'; 
    
        const editOption = document.createElement('div');
        editOption.className = 'options-item';
        editOption.textContent = 'Edit';
        editOption.onclick = () => {
          console.log(`Edit clicked for message ID: ${msg.msgid}`);
          startEditingMessage(msgDiv.dataset.messageId, textDiv.textContent.trim());
        };
        
        const deleteOption = document.createElement('div');
        deleteOption.className = 'options-item';
        deleteOption.textContent = 'Delete';
        deleteOption.onclick = () => {
          const msgId = msgDiv.dataset.messageId;
          console.log(`Delete clicked for message ID: ${msgId}`);
          if (msgId) {
            deleteMessageById(msgId, search.groupID);
          }
        };
        
        
    
        menu.appendChild(editOption);
        menu.appendChild(deleteOption);
        msgDiv.appendChild(menu);
    
        optionsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.toggle('hidden');
        });
      }
    
      chatMessages.appendChild(msgDiv);
    });
    
  
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (error) {
    console.error("Error loading messages:", error);
    chatMessages.innerHTML = '<p class="error">Error loading messages.</p>';
  }
}

document.addEventListener('click', () => {
  document.querySelectorAll('.options-menu').forEach(menu => {
    menu.classList.add('hidden');
  });
});


// gets all the groupchats the user is in 
async function getGroupByUser() {
  if (!userID) {
      console.error("User not available");
      return;
  }

  try {
      const response = await fetch(`${apibase}/usergroupchat`, {
          method: 'GET',
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-type": 'application/json'
          }
      });

      if (response.ok) {
          const group = await response.json();
          grouplist.innerHTML = "";

          group.forEach(groupchat => {
              const li = document.createElement('li');
              li.className = 'custom-group-item position-relative';

              const groupNameDiv = document.createElement('div');
              groupNameDiv.className = 'group-name';
              groupNameDiv.textContent = groupchat.groupName || 'Unnamed Group';

              const lastMessageDiv = document.createElement('div');
              lastMessageDiv.className = 'last-message';
              lastMessageDiv.textContent = groupchat.lastMessage || 'No messages yet.';

              // Click on li (group item)
              li.addEventListener('click', async () => {
                document.querySelectorAll('.custom-group-item').forEach(item =>
                    item.classList.remove('active')
                );
                li.classList.add('active');
            
                const roomName = groupchat.groupName;
            
                // Get group ID to join the correct room
                const group = await searchGroupByName(roomName);
                if (!group || !group.groupID) {
                    console.error("Invalid group or missing ID.");
                    return;
                }
            
                const roomID = `group_${group.groupID}`;
                socket.emit('joinGroup', group.groupID);            
                // Load messages
                loadMessagesForGroup(roomName);
            });
            

              li.appendChild(groupNameDiv);
              li.appendChild(lastMessageDiv);

              grouplist.appendChild(li);
          });

      }
  } catch (err) {
      console.error("Failed to fetch properly", err);
  }
}

// function that shows the create group form 
function showCreateGroupForm() {
    const restorepoint = mainwrapper.innerHTML;

    mainwrapper.innerHTML = `
    <div class="w-100 p-5 text-start" style="max-width: 800px; margin: auto;">
      <h2 class="mb-4">Create New Group</h2>
      <form id="createGroupForm">
        <div class="mb-3">
          <label for="groupName" class="form-label">Group Name</label>
          <input type="text" class="form-control" id="groupName" required>
        </div>
        <div class="mb-3">
          <label for="groupDesc" class="form-label">Description</label>
          <textarea class="form-control" id="groupDesc" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label for="groupInterest" class="form-label">Group Interest</label>
          <input type="text" class="form-control" id="groupInterest" required>
        </div>
        <div class="d-flex gap-3 mt-4">
          <button type="submit" class="btn btn-primary">Create</button>
          <button type="button" class="btn btn-secondary" id="cancelCreate">Cancel</button>
        </div>
        <div id="formNotification" class="form-notification hidden"></div>
      </form>
    </div>
  `;


  
  document.getElementById("createGroupForm").addEventListener('submit', async (event) => {
    event.preventDefault();
    const notificationBar = document.getElementById("formNotification");
    const name = document.getElementById("groupName").value;
    const desc = document.getElementById("groupDesc").value;
    const interest = document.getElementById("groupInterest").value;

    const groupData = {
        name:name,
        description:desc,
        interest:interest
    };
    console.log(groupData);
    try {
        const response = await fetch(`${apibase}/groupchat`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(groupData), 
          });

          if (response.ok){
            notificationBar.textContent = "Group has been created successfully!";
            notificationBar.style.backgroundColor = "#28a745"; 
            notificationBar.style.display = "block";
            setTimeout(() => notificationBar.style.display = "none", 3000);
            location.reload();
          } else {
            notificationBar.textContent = "Failed to create group.";
            notificationBar.style.backgroundColor = "#dc3545"; 
            notificationBar.style.display = "block";
            setTimeout(() => notificationBar.style.display = "none", 3000);
          }
    }catch (err) {
        notificationBar.textContent = "Error occurred while creating group.";
        notificationBar.style.backgroundColor = "#dc3545";
        notificationBar.style.display = "block";
        setTimeout(() => notificationBar.style.display = "none", 3000);
        console.error("Submission error:", err);}
  });
  document.getElementById("cancelCreate").addEventListener("click", () => {
    mainwrapper.innerHTML = restorepoint;
    window.location.reload(); 
  });
  }

// gets the group name and which group is clicked on
document.getElementById('custom-group-list').addEventListener('click', (e) => {
  const item = e.target.closest('.custom-group-item');
  if (!item) return;

  document.querySelectorAll('.custom-group-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');

  const groupName = item.querySelector('.group-name')?.textContent.trim() || 'Unnamed group';
  console.log('Clicked group name:', groupName);

  const nameDisplay = document.getElementById('groupNameDisplay');
  nameDisplay.textContent = groupName;


  const optionsBtn = document.getElementById('chatOptionsBtn');
  optionsBtn.classList.remove('hidden');
});

chatOptionsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log("Chat options button clicked");
  chatDropdownMenu.classList.remove('hidden'); 
  chatDropdownMenu.classList.toggle('visible'); 
});


document.addEventListener('click', () => {
  chatDropdownMenu.classList.remove('visible');
});

document.getElementById("editGroup").addEventListener("click", async () => {
  const groupName = document.getElementById("groupNameDisplay")?.textContent?.trim();
  if (!groupName || groupName === "Select a group") {
    alert("Please select a group to edit.");
    return;
  }
  
  const group = await searchGroupByName(groupName);
  if (!group) {
    alert("Group not found.");
    return;
  }

  showEditGroupForm(group);
});





// function to show the editing form 
function showEditGroupForm(group) {
  const restorepoint = mainwrapper.innerHTML;

  mainwrapper.innerHTML = `
    <div class="w-100 p-5 text-start" style="max-width: 800px; margin: auto;">
      <h2 class="mb-4">Edit Group</h2>
      <form id="editGroupForm">
        <input type="hidden" id="groupID" value="${group.groupID}">
        <div class="mb-3">
          <label for="groupName" class="form-label">Group Name</label>
          <input type="text" class="form-control" id="groupName" value="${group.groupName}" required>
        </div>
        <div class="mb-3">
          <label for="groupDesc" class="form-label">Description</label>
          <textarea class="form-control" id="groupDesc" rows="3">${group.groupDesc || ''}</textarea>
        </div>
        <div class="mb-3">
          <label for="groupInterest" class="form-label">Group Interest</label>
          <input type="text" class="form-control" id="groupInterest" value="${group.groupInterest || ''}" required>
        </div>
        <div class="d-flex gap-3 mt-4">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button>
        </div>
        <div id="formNotification" class="form-notification hidden mt-3"></div>
      </form>
    </div>
  `;

  document.getElementById("cancelEdit").addEventListener("click", () => {
    mainwrapper.innerHTML = restorepoint;
    window.location.reload();
  });

  document.getElementById("editGroupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const notificationBar = document.getElementById("formNotification");

    const updatedData = {
      groupName: document.getElementById("groupName").value,
      groupDesc: document.getElementById("groupDesc").value,
      groupInterest: document.getElementById("groupInterest").value,
    };

    const groupID = document.getElementById("groupID").value;

    try {
      const response = await fetch(`${apibase}/groupchat/${groupID}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        notificationBar.textContent = "Group updated successfully!";
        notificationBar.style.backgroundColor = "#28a745";
        notificationBar.style.display = "block";
        setTimeout(() => window.location.reload(), 2000);
      } else {
        notificationBar.textContent = "Failed to update group.";
        notificationBar.style.backgroundColor = "#dc3545";
        notificationBar.style.display = "block";
      }
    } catch (err) {
      notificationBar.textContent = "An error occurred.";
      notificationBar.style.backgroundColor = "#dc3545";
      notificationBar.style.display = "block";
      console.error("Edit error:", err);
    }
  });
}



// deletion of group 
document.getElementById('deleteGroup').addEventListener('click', async () => {
  const groupName = document.getElementById("groupNameDisplay")?.textContent?.trim();
  if (!groupName || groupName === "Select a group") {
    alert("Please select a group to delete.");
    return;
  }

  const group = await searchGroupByName(groupName);
  if (!group) {
    alert("Group not found.");
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete the group "${groupName}"?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${apibase}/groupchat/${group.groupID}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      alert(`Group "${groupName}" deleted successfully.`);
      window.location.reload();  
    } else {
      alert("Failed to delete group.");
      console.error("Delete failed with status:", response.status);
    }
  } catch (err) {
    alert("Error occurred during deletion.");
    console.error("Delete error:", err);
  }

  chatDropdownMenu.classList.remove('visible');
});



// Function to create a new message
async function createMessage(name) {
  const input = document.getElementById('messageInput');
  const messageText = input.value.trim();
  const groupName = document.getElementById('groupNameDisplay')?.textContent?.trim();
  const group = await searchGroupByName(name);
  socket.emit('joinGroup', group.groupID);
  if (!messageText || !groupName || groupName === "Select a group") {
    console.warn("Missing message or group selection.");
    return;
  }

  const messageData = {
    groupid: group.groupID,
    senderid: userID,
    sender: userName,
    content: messageText,
    timestamp: new Date().toISOString()
  };
  console.log("Creating message:", messageData);
  // Emit to socket.io
  socket.emit('chatMessage', messageData);
  console.log("Sent message:", messageData);

  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('chat-message', 'sent');
  msgDiv.style.position = 'relative'; 

  
  const userDiv = document.createElement('div');
  userDiv.className = 'message-user';
  userDiv.textContent = 'You';
  msgDiv.appendChild(userDiv);

  
  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  textDiv.textContent = messageText;
  msgDiv.appendChild(textDiv);

  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = new Date(messageData.timestamp).toLocaleTimeString();
  msgDiv.appendChild(timeDiv);

  
  const optionsBtn = document.createElement('button');
  optionsBtn.className = 'options-button';
  optionsBtn.textContent = '⋮';
  msgDiv.appendChild(optionsBtn);

  
  const menu = document.createElement('div');
  menu.className = 'options-menu hidden';

  const editOption = document.createElement('div');
  editOption.className = 'options-item';
  editOption.textContent = 'Edit';
  editOption.onclick = () => {
    console.log('Edit clicked for newly sent message');
    startEditingMessage(msgDiv.dataset.messageId, textDiv.textContent.trim());
  };

  const deleteOption = document.createElement('div');
  deleteOption.className = 'options-item';
  deleteOption.textContent = 'Delete';
  deleteOption.onclick = () => {
    const msgId = msgDiv.dataset.messageId;
    console.log(`Delete clicked for message ID: ${msgId}`);
    if (msgId) {
      deleteMessageById(msgId);
    }
  };

  menu.appendChild(editOption);
  menu.appendChild(deleteOption);
  msgDiv.appendChild(menu);

  optionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    if (!menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    }
  });

  chatMessages.appendChild(msgDiv);


  chatMessages.scrollTop = chatMessages.scrollHeight;

  const groupItems = document.querySelectorAll('.custom-group-item');
  groupItems.forEach(item => {
    const name = item.querySelector('.group-name')?.textContent?.trim();
    if (name === groupName) {
      const lastMsg = item.querySelector('.last-message');
      if (lastMsg) {
        lastMsg.textContent = messageText;
      }
    }
  });

  // send message to the db 
  try{
    const response = await fetch(`${apibase}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageData),
  });
  if (!response.ok) {
    console.error("Failed to send message:", response.status);
    return;
  }
  
  const savedMessage = await response.json();
  console.log("Message saved:", savedMessage);
  const messageID = savedMessage[0]?.msgid;
  
  if (messageID) {
    msgDiv.dataset.messageId = messageID; 
    console.log("Message saved with ID:", messageID);
  }
  } catch (err) {
    console.error("Error sending message:", err);
  }

  input.value = '';
}


document.getElementById("update-button").addEventListener("click", async () => {
  const messageInput = document.getElementById("message-input");
  const newText = messageInput.value.trim();
  const editingId = messageInput.dataset.editing;

  if (!editingId || !newText) return;

  try {
    const response = await fetch(`${apibase}/message/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content: newText })
    });

    if (!response.ok) throw new Error("Failed to update");

    // Update the message in the DOM
    const msgDiv = document.querySelector(`.chat-message[data-message-id="${editingId}"]`);
    const textDiv = msgDiv.querySelector(".message-text");
    textDiv.textContent = newText;

    // Reset UI
    messageInput.value = "";
    delete messageInput.dataset.editing;
    document.getElementById("update-button").classList.add("hidden");

    alert("Message updated.");
  } catch (err) {
    console.error("Error updating message:", err);
    alert("Failed to update message.");
  }
});


async function startEditingMessage(messageId, messageText) {
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("sendMessageBtn");
  const updateBtn = document.getElementById("update-button");

  messageInput.value = messageText;
  messageInput.dataset.editing = messageId;
  messageInput.focus();

  updateBtn.classList.remove("hidden");
  sendBtn.classList.add("hidden");
}


// does the delete function of the message
async function deleteMessageById(messageId) {
  try {
    
    const response = await fetch(`${apibase}/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error("Failed to delete message:", response.status);
      return;
    }
    const groupName = document.getElementById('groupNameDisplay')?.textContent?.trim();
    const groupInfo = await searchGroupByName(groupName);
    // Update UI
    const msgDiv = document.querySelector(`.chat-message[data-message-id="${messageId}"]`);
    if (msgDiv) {
      msgDiv.innerHTML = `
        <div class="message-text deleted-text">This message has been deleted</div>
      `;
      msgDiv.classList.add("deleted-message");
    }
    console.log(groupInfo.groupID);
    console.log(messageId);
    socket.emit("deleteMessage", {
      messageId,
      groupID: groupInfo.groupID  
    });
    
    
    alert("Message deleted.");

  } catch (err) {
    console.error("Error deleting message:", err);
  }
}


// listenter for the create chat when the user hits send 
document.getElementById('sendMessageBtn').addEventListener('click', () => {
  const groupName = document.getElementById('groupNameDisplay')?.textContent?.trim();
  createMessage(groupName);
});


// loads when the page is loaded
window.onload = () => {
    getGroupByUser();
};
  
