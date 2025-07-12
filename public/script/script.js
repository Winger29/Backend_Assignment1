// popup_script.js
document.addEventListener("DOMContentLoaded", () => {
  function openPopup(id) {
    document.getElementById(id).style.display = 'block';
    document.getElementById("overlay").style.display = 'block';
  }

  function closePopup() {
    document.querySelectorAll('.popup').forEach(p => p.style.display = 'none');
    document.getElementById("overlay").style.display = 'none';
  }

  function toggleForm() {
    const role = document.getElementById("role").value;
    document.getElementById("seniorFields").classList.toggle("hidden", role !== "senior");
    document.getElementById("staffFields").classList.toggle("hidden", role !== "staff");
  }
  
  function switchToSignup() {
  closePopup();
  openPopup('signupPopup'); // Show signup modal
  }

 function switchToLogin(){
  closePopup();
  openPopup("loginPopup");
 }

 function showUpdateProfileForm() {
  document.getElementById("profilePopup").style.display = "none";
  document.getElementById("updateProfilePopup").style.display = "block";
}
  async function submitForm(event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const data = {
      role,
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      profileImage: document.getElementById("profileImage").value
    };

    if (role === "senior") {
      data.dob = document.getElementById("dob").value;
      data.interests = document.getElementById("interests").value;
    } else if (role === "staff") {
      data.staffId = document.getElementById("staffId").value;
      data.clinicId = document.getElementById("clinicId").value;
    }

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok && result.redirect) {
        window.location.href = result.redirect;
      } else {
        document.getElementById("result").innerText = result.error || "Registration failed.";
      }
    } catch (err) {
      console.error(err);
      document.getElementById("result").innerText = "Something went wrong.";
    }
  }

  async function loginUser(event) {
    event.preventDefault();

    const data = {
      role: document.getElementById("loginRole").value,
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    };

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok && result.redirect) {
        //sessionStorage.setItem("userId", result.userId); // or seniorId/staffId
        //sessionStorage.setItem("role", result.role); 
        localStorage.setItem("token",result.token);
        window.location.href = result.redirect;
      } else {
        document.getElementById("loginResult").innerText = result.error || "Login failed.";
      }
    } catch (err) {
      console.error(err);
      document.getElementById("loginResult").innerText = "Login error occurred.";
    }
  }
  function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
  }

  function openPopupProfile() {
    const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in.");
    return;
  }

  const decoded = parseJwt(token);
  if (!decoded || !decoded.role || !decoded.id) {
    alert("Invalid or expired token.");
    return;
  }

  const role = decoded.role;
  const id = decoded.id;

    console.log("Loading profile for:", { role, id });

    if (!role || !id) {
      alert("You are not logged in.");
      return;
    }

    document.getElementById("profileContent").innerHTML = "Loading...";
    document.getElementById("profilePopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";

    fetch("http://localhost:3000/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
      .then(res => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Fetched profile data:", data);

        if (data.error) {
          document.getElementById("profileContent").innerHTML =
            `<p style="color:red;">${data.error}</p>`;
          return;
        }

        const html = `
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${role === "staff" ? `
            <p><strong>Clinic ID:</strong> ${data.clinicId}</p>
            <p><strong>Position:</strong> ${data.position}</p>
          ` : `
            <p><strong>Date of Birth:</strong>  ${new Date(data.dob).toISOString().split("T")[0]}</p>
            <p><strong>Interests:</strong> ${data.interests}</p>
            <div class="profile-buttons" style="margin-top: 20px;">
            
          </div>
          `}
          <div class="profile-buttons" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button onclick="showUpdateProfileForm()">Update</button>
            <button onclick="deleteProfile()" style="background-color: #e53935;">Delete</button>
          </div>
        `;
        document.getElementById("profileContent").innerHTML = html;
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        document.getElementById("profileContent").innerHTML =
          `<p style="color:red;">Failed to load profile.</p>`;
      });
  }

  function showUpdateProfileForm() {
  const token = localStorage.getItem("token");
  const decoded = parseJwt(token);
  if (!decoded) return;

  // Fetch profile to prefill
  fetch("http://localhost:3000/profile", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("editFullName").value = data.fullName || "";
      document.getElementById("editPassword").value = "********"; // placeholder

      if (decoded.role === "senior") {
        document.getElementById("editInterests").value = data.interests || "";
        document.getElementById("interestsWrapper").style.display = "block";
        document.getElementById("positionWrapper").style.display = "none";
      } else if (decoded.role === "staff") {
        document.getElementById("editPosition").value = data.position || "";
        document.getElementById("interestsWrapper").style.display = "none";
        document.getElementById("positionWrapper").style.display = "block";
      }

      document.getElementById("profilePopup").style.display = "none";
      const updatePopup = document.getElementById("updateProfilePopup");
      updatePopup.classList.remove("hidden");
      updatePopup.style.display = "block";
      document.getElementById("overlay").style.display = "block";
    })
    .catch((err) => {
      console.error("Failed to load for update:", err);
    });
}

function enableEdit(id) {
  const input = document.getElementById(id);
  input.removeAttribute("readonly");
  if (id === "editPassword" && input.value === "********") {
    input.value = "";
  }
  input.focus();
}

async function updateProfile(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  const decoded = parseJwt(token);
  if (!decoded) return;

  const updatedData = {
    fullName: document.getElementById("editFullName").value,
    password: document.getElementById("editPassword").value === "********" ? undefined : document.getElementById("editPassword").value,
  };

  if (decoded.role === "senior") {
    updatedData.interests = document.getElementById("editInterests").value;
  } else if (decoded.role === "staff") {
    updatedData.position = document.getElementById("editPosition").value;
  }

  try {
    const res = await fetch("http://localhost:3000/profile", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });
    const result = await res.json();
    alert(result.message || "Updated successfully.");
    closePopup();
    openPopupProfile();
  } catch (err) {
    console.error("Update failed:", err);
    alert("Update failed.");
  }
}
function deleteProfile() {
  const confirmed = confirm("Are you sure you want to delete your profile?");
  if (!confirmed) return;

  const token = localStorage.getItem("token");

  fetch("http://localhost:3000/profile", {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(result => {
      alert(result.message || "Profile deleted.");
      localStorage.clear();
      window.location.href = "index.html";
    })
    .catch(() => alert("Delete failed."));
}
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("open");
  sidebar.classList.toggle("closed");
}


  // Expose functions to window for HTML inline handlers
  window.openPopup = openPopup;
  window.closePopup = closePopup;
  window.toggleForm = toggleForm;
  window.submitForm = submitForm;
  window.loginUser = loginUser;
  window.openPopupProfile = openPopupProfile;
  window.switchToSignup = switchToSignup;
  window.switchToLogin = switchToLogin;
  window.showUpdateProfileForm=showUpdateProfileForm;
  window.enableEdit=enableEdit;
  window.deleteProfile=deleteProfile;
  window.updateProfile=updateProfile;
  window.toggleSidebar=toggleSidebar;
});