// layout.js

// Insert Navbar
function insertNavbar() {
    if (!document.querySelector(".topbar")) {
    const topbar = `
        <div class="topbar">
        <h1>SeniorCare Platform</h1>
        <div class="right-links">
            <a href="senior.html">Home</a>
            <a href="about.html">AboutUs</a>
            <a href="#" onclick="openProfilePopup()">
                <span class="icon">👤</span> My Profile</a>
        </div>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", topbar);
    }
}

// Insert Sidebar (optional)
function insertSidebar() {
    if (!document.querySelector(".sidebar")) {
    const sidebar = `
        <div class="sidebar">
            <a href="senior.html">🏠 Dashboard</a>
            <a href="activities.html">🏃‍♂️ Physical Activities</a>
            <a href="booking.html">📅 Appointment</a>
            <a href="event.html">🎉 Events</a>
            <a href="groupchat.html">💬 Messages</a>
            <a href="#">⏰ Reminder</a>
            <a href="#" onclick="logout()">🚪 Logout</a>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", sidebar);
    }
}

// Optional: Logout handler
function logout() {
  localStorage.clear();
  alert("Logged out successfully.");
  window.location.href="index.html";
}

// Call insertion functions
insertNavbar();
insertSidebar();
