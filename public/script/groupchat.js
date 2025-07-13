const apibase = "http://localhost:3000";
const token = localStorage.getItem('token')
const grouplist = document.getElementById("custom-group-list");
const mainwrapper = document.getElementById("main-wrapper");
let userID = "";

if (token) {
    try{ 
        console.log(token);
        const split = JSON.parse(atob(token.split('.')[1]));
        console.log(split);
        userID = split.id;
        console.log(userID)
        } catch(e) {
            console.error("Invalid token, check if its correct")
        }
} 
else {
    console.log("No token found")
}

async function getGroupByUser() {
    if (!userID) {
        console.error("User not available")
        return;
    }

    try{
        const response = await fetch(`${apibase}/usergroupchat`,{
            method: 'GET',
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-type": 'application/json'
            }
        });

        if (response.ok) {
            const group = await response.json();
            grouplist.innerHTML = "";
            group.forEach(groupchat => {
                const li = document.createElement('li');
                li.className = 'custom-group-item';
                li.textContent = groupchat.groupName || 'error, check code';
                grouplist.appendChild(li);
            });
        }
    } catch(err) {
        console.error("Failed to fetch properly")
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



document.addEventListener("DOMContentLoaded",getGroupByUser);
