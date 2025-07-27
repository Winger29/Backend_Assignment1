const apibase = "http://localhost:3000";
const token = localStorage.getItem('token')
const grouplist = document.getElementById("custom-group-list");
const mainwrapper = document.getElementById("main-wrapper");
let userID = "";

if (token) {
    try{ 
        const split = JSON.parse(atob(token.split('.')[1]));
        userID = split.id;
        } catch(e) {
            console.error("Invalid token, check if its correct")
        }
} 
else {
    console.log("No token found")
}


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
          
              // Create the 3-dot menu button with an image icon
              const optionsBtn = document.createElement('button');
              optionsBtn.className = 'options-btn';
              optionsBtn.type = 'button'; // prevent default submit behavior
          
              const img = document.createElement('img');
              img.src = 'images/horizontal_3dot.svg';  // <-- Replace with your 3-dot icon path
              img.alt = 'Options';
              img.className = 'options-icon';
              optionsBtn.appendChild(img);
          
              // Dropdown menu container
              const dropdownMenu = document.createElement('div');
              dropdownMenu.className = 'dropdown-menu hidden';
              dropdownMenu.innerHTML = `
                  <div class="dropdown-item">Edit</div>
                  <div class="dropdown-item">Delete</div>
              `;
          
              // Toggle dropdown on button click
              optionsBtn.addEventListener('click', (e) => {
                  e.stopPropagation(); // prevent li click
                  const isHidden = dropdownMenu.classList.contains('hidden');
          
                  // Close all other dropdowns first
                  document.querySelectorAll('.dropdown-menu').forEach(menu => {
                      menu.classList.add('hidden');
                  });
          
                  // Toggle current dropdown
                  if (isHidden) {
                      dropdownMenu.classList.remove('hidden');
                  } else {
                      dropdownMenu.classList.add('hidden');
                  }
              });
          
              // Close dropdown if clicking outside of li
              li.addEventListener('click', () => {
                  // This is for selecting the group
                  document.querySelectorAll('.custom-group-item').forEach(item =>
                      item.classList.remove('active')
                  );
                  li.classList.add('active');
          
                  // Close any dropdown open within this li
                  dropdownMenu.classList.add('hidden');
              });
          
              // Close dropdown on clicking outside li or dropdown
              document.addEventListener('click', (e) => {
                  if (!li.contains(e.target)) {
                      dropdownMenu.classList.add('hidden');
                  }
              });
          
              li.appendChild(groupNameDiv);
              li.appendChild(lastMessageDiv);
              li.appendChild(optionsBtn);
              li.appendChild(dropdownMenu);
          
              grouplist.appendChild(li);
          });
          
        }
    } catch (err) {
        console.error("Failed to fetch properly", err);
    }
}


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

  // Show group name in the chat area box
  const nameDisplay = document.getElementById('group-name-display');
  nameDisplay.textContent = groupName;
  nameDisplay.style.display = 'block';
});




  window.onload = () => {
    getGroupByUser();
  };
  
