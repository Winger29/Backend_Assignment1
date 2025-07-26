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
    document.getElementById("organiserFields").classList.toggle("hidden", role !== "organiser");
    document.getElementById("dob")?.toggleAttribute("required", role === "senior");
    document.getElementById("interests")?.toggleAttribute("required", role === "senior");
    document.getElementById("clinicId")?.toggleAttribute("required", role === "staff");
    document.getElementById("staffId")?.toggleAttribute("required", role === "staff");
    document.getElementById("contactNumber")?.toggleAttribute("required", role === "organiser");
  }
  
  function switchToSignup() {
  closePopup();
  openPopup('signupPopup'); // Show signup modal
  }

 function switchToLogin(){
  closePopup();
  openPopup("loginPopup");
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

function showUpdateProfileForm() {
    const token = localStorage.getItem("token");
    const decoded = parseJwt(token);
    if (!decoded) return;

    fetch("http://localhost:3000/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("editFullName").value = data.fullName || "";
        document.getElementById("editPassword").value = "********";
        document.getElementById("editPassword").type = "password";
        if (decoded.role === "senior") {
          document.getElementById("editInterests").value = data.interests || "";
          document.getElementById("interestsWrapper").style.display = "block";
          document.getElementById("positionWrapper").style.display = "none";
          document.getElementById("contactNumberWrapper").style.display = "none";
        } else if (decoded.role === "staff") {
          document.getElementById("editPosition").value = data.position || "";
          document.getElementById("interestsWrapper").style.display = "none";
          document.getElementById("positionWrapper").style.display = "block";
          document.getElementById("contactNumberWrapper").style.display = "none";
        } else if (decoded.role === "organiser") {
          document.getElementById("editContactNumber").value = data.contactNumber || "";
          document.getElementById("interestsWrapper").style.display = "none";
          document.getElementById("positionWrapper").style.display = "none";
          document.getElementById("contactNumberWrapper").style.display = "block";
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
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      alert("Session expired. Please login again.");
      window.location.href = "index.html";
      return;
    }

    const password = document.getElementById("editPassword").value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    if (password && password !== "********" && !passwordRegex.test(password)) {
      alert("Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    const updatedData = {
      fullName: document.getElementById("editFullName").value,
      password: password === "********" ? undefined : password
    };

    if (decoded.role === "senior") {
      updatedData.interests = document.getElementById("editInterests").value;
    } else if (decoded.role === "staff") {
      updatedData.position = document.getElementById("editPosition").value;
    } else if (decoded.role === "organiser") {
      updatedData.contactNumber = document.getElementById("editContactNumber").value;
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
  
  async function submitForm(event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    const data = {
      role,
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      password,
    };

    if (role === "senior") {
      data.profileImage= document.getElementById("profileImage").value;
      data.dob = document.getElementById("dob").value;
      data.interests = document.getElementById("interests").value;
    } else if (role === "staff") {
      data.profileImage= document.getElementById("profileImage").value;
      data.staffId = document.getElementById("staffId").value;
      data.clinicId = document.getElementById("clinicId").value;
    } else if (role === "organiser") {
      data.contactNumber = document.getElementById("contactNumber").value;
    }

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
         },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok && result.redirect) {
        localStorage.setItem("token",result.token);
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
        headers: { 
          "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok && result.redirect) {
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
  

  function openPopupProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in.");
    return;
  }

  const decoded = parseJwt(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) {
    localStorage.clear();
    alert("Session expired. Please login again.");
    window.location.href = "index.html";
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
          ` : role === "senior" ? `
            <p><strong>Date of Birth:</strong> ${new Date(data.dob).toISOString().split("T")[0]}</p>
            <p><strong>Interests:</strong> ${data.interests}</p>
          ` : role === "organiser" ? `
            <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
          ` : ``}
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

function logout() {
  localStorage.clear();
  alert("Logged out successfully.");
  window.location.href="index.html";
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
  window.logout=logout;
  
});