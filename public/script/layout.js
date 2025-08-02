// layout.js

// Insert Navbar
function insertNavbar() {
    if (!document.querySelector(".topbar")) {
    const topbar = `
        <div class="topbar">
        <button class="toggle-sidebar" onclick="toggleSidebar()">☰</button>
        <h1>SeniorCare Platform</h1>
        <div class="right-links">
            <a href="senior.html">Home</a>
            <a href="about.html">AboutUs</a>
            <a href="#"  onclick="openPopupProfile()"><span class="icon">👤</span> My Profile</a>
        </div>
        </div>
        <div class="overlay" id="overlay" onclick="closePopup()"></div>
        <div class="popup" id="profilePopup">
         <span class="close-btn" onclick="closePopup()">×</span>
         <h2>My Profile</h2>
        <div id="profileContent" ></div>
        </div>
    <div class="popup hidden" id="updateProfilePopup">
    <span class="close-btn" onclick="closePopup()">×</span>
    <h2>Edit Profile</h2>
    <form id="updateForm" onsubmit="updateProfile(event)">
      <div class="form-group">
        <label>Full Name:</label>
        <div class="editable-field">
          <input type="text" id="editFullName" readonly />
          <button type="button" onclick="enableEdit('editFullName')">✏️</button>
        </div>
      </div>
      <div class="form-group">
        <label>Password:</label>
        <div class="editable-field">
          <input type="password" id="editPassword" value="********" required readonly />
          <button type="button" onclick="enableEdit('editPassword')">✏️</button>
        </div>
      </div>
      <div id="interestsWrapper">
        <label>Interests:</label>
        <div class="editable-field">
          <input type="text" id="editInterests" readonly />
          <button type="button" onclick="enableEdit('editInterests')">✏️</button>
        </div>
      </div>
      <div id="positionWrapper">
        <label>Position:</label>
        <div class="editable-field">
          <input type="text" id="editPosition" readonly />
          <button type="button" onclick="enableEdit('editPosition')">✏️</button>
        </div>
      </div>
      <div id="contactNumberWrapper" style="display:none">
        <label for="editContactNumber">Contact Number:</label>
        <input type="text" id="editContactNumber" readonly />
        <button type="button" onclick="enableEdit('editPosition')">✏️</button>
      </div>
      <button type="submit">Save Changes</button>
    </form>
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
            <a href="eventUser.html">🎉 Events</a>
            <a href="groupchat.html">💬 Messages</a>
            <a href="#">⏰ Reminder</a>
            <a href="#" onclick="logout()">🚪 Logout</a>
        </div>
    `;
    document.body.insertAdjacentHTML("afterbegin", sidebar);
    }
}


// Call insertion functions
insertNavbar();
insertSidebar();
