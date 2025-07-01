// popup_script.js

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
      window.location.href = result.redirect;
    } else {
      document.getElementById("loginResult").innerText = result.error || "Login failed.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("loginResult").innerText = "Login error occurred.";
  }
}

// Expose functions to window for HTML inline handlers
window.openPopup = openPopup;
window.closePopup = closePopup;
window.toggleForm = toggleForm;
window.submitForm = submitForm;
window.loginUser = loginUser;
