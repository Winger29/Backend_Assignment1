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
        sessionStorage.setItem("userId", result.userId); // or seniorId/staffId
        sessionStorage.setItem("role", result.role); 
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
    const role = sessionStorage.getItem("role");
    const id = sessionStorage.getItem("userId");

    console.log("Loading profile for:", { role, id });

    if (!role || !id) {
      alert("You are not logged in.");
      return;
    }

    document.getElementById("profileContent").innerHTML = "Loading...";
    document.getElementById("profilePopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";

    fetch(`http://localhost:3000/profile?role=${role}&id=${id}`)
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
          `}
        `;
        document.getElementById("profileContent").innerHTML = html;
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        document.getElementById("profileContent").innerHTML =
          `<p style="color:red;">Failed to load profile.</p>`;
      });
  }

// Expose functions to window for HTML inline handlers
window.openPopup = openPopup;
window.closePopup = closePopup;
window.toggleForm = toggleForm;
window.submitForm = submitForm;
window.loginUser = loginUser;
window.openPopupProfile=openPopupProfile;
});