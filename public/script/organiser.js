document.addEventListener("DOMContentLoaded", () => {
  fetchEvents();
});

async function fetchEvents() {
  try {
    const response = await fetch("/events");
    if (!response.ok) throw new Error("Failed to fetch events");

    const events = await response.json();
    const container = document.getElementById("eventsContainer");
    container.innerHTML = "";

    // Get current user info from localStorage
    const token = localStorage.getItem("token");
    let currentUserId = null;
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }

    events.forEach(event => {
      const div = document.createElement("div");
      div.classList.add("event-card");
      div.id = `event-${event.eventId}`;

      // Check if current user is the organiser of this event
      const isOwner = currentUserId === event.organiserId;
      
      let actionButtons = '';
      if (isOwner) {
        actionButtons = `
          <button onclick="deleteEvent(${event.eventId})" class="btn-danger">Delete</button>
          <button onclick='showEditForm(${JSON.stringify(event)})' class="btn-secondary">Edit</button>
        `;
      } 

      div.innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Organiser:</strong> ${event.organiserName || 'Unknown organiser'}, ${event.organiserId}</p>
        <p><strong>Date:</strong> ${formatDate(event.eventDate)}</p>
        <p><strong>Time:</strong> ${event.startTime} – ${event.endTime}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <div class="event-actions">
          ${actionButtons}
          <button onclick="viewSignups(${event.eventId})" class="btn-primary">View Signups</button>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("eventsContainer").textContent = "Error loading events.";
  }
}

async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to delete events.");
    return;
  }

  try {
    const res = await fetch(`/events/${id}`, { 
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete event");
    }
    
    fetchEvents();
  } catch (err) {
    console.error("Delete error:", err);
    alert(err.message || "Failed to delete event.");
  }
}

function showEditForm(event) {
  const container = document.getElementById("eventsContainer");

  const form = document.createElement("form");
  form.innerHTML = `
    <h3>Edit Event: ${event.title}</h3>
    <label>Title:<br/> <input name="title" value="${event.title}" required /></label><br/><br/>
    <label>Date:<br/> <input type="date" name="eventDate" value="${event.eventDate.split('T')[0]}" required /></label><br/><br/>
    <label>Start Time:<br/> <input type="text" name="startTime" required /></label><br/><br/>
    <label>End Time:<br/> <input type="text" name="endTime" required /></label><br/><br/>
    <label>Location:<br/> <input name="location" value="${event.location}" required /></label><br/><br/>
    <button type="submit">Save</button>
    <button type="button" onclick="fetchEvents()">Cancel</button>
  `;

  container.innerHTML = "";
  container.appendChild(form);

  const startInput = form.querySelector('input[name="startTime"]');
  const endInput = form.querySelector('input[name="endTime"]');

  flatpickr(startInput, {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i:S",
    time_24hr: true,
    defaultDate: event.startTime
  });

  flatpickr(endInput, {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i:S",
    time_24hr: true,
    defaultDate: event.endTime
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const start = formData.get("startTime");
    const end = formData.get("endTime");

    if (!isEndTimeValid(start, end)) {
      alert("End time must be later than start time.");
      return;
    }

    const updated = {
      title: formData.get("title"),
      eventDate: formData.get("eventDate"),
      startTime: start,
      endTime: end,
      location: formData.get("location"),
      organiserId: event.organiserId
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to edit events.");
        return;
      }

      const res = await fetch(`/events/${event.eventId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update event");
      }
      
      fetchEvents();
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message || "Failed to update event.");
    }
  };
}

function isEndTimeValid(startTime, endTime) {
  if (!startTime || !endTime) return false;

  const [sh, sm, ss] = startTime.split(":").map(Number);
  const [eh, em, es] = endTime.split(":").map(Number);

  const startSec = sh * 3600 + sm * 60 + ss;
  const endSec = eh * 3600 + em * 60 + es;

  return endSec > startSec;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

async function viewSignups(eventId) {
  try {
    const response = await fetch(`/events/${eventId}/signups`);
    if (!response.ok) throw new Error("Failed to fetch signups");

    const data = await response.json();
    showSignupsPopup(data);
  } catch (err) {
    console.error("Error fetching signups:", err);
    alert("Failed to load signups.");
  }
}

function showSignupsPopup(data) {
  
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.id = "signupsPopup";
  popup.style.display = "block";
  
  
  let content = `
    <span class="close-btn" onclick="closeSignupsPopup()">×</span>
    <h2>Event Signups</h2>
    <p><strong>Total Attendees:</strong> ${data.totalAttendees}</p>
  `;
  
  if (data.signups && data.signups.length > 0) {
    content += `
      <div class="signups-list">
        <h3>Attendees:</h3>
        <table>
          <thead>
            <tr>
              <th>Senior ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    data.signups.forEach(signup => {
      content += `
        <tr>
          <td>${signup.seniorid}</td>
          <td>${signup.fullName}</td>
        </tr>
      `;
    });
    
    content += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    content += '<p>No signups yet for this event.</p>';
  }
  
  popup.innerHTML = content;
  
  
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.id = "signupsOverlay";
  overlay.style.display = "block";
  overlay.onclick = closeSignupsPopup;
  
  
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
}

function closeSignupsPopup() {
  const popup = document.getElementById("signupsPopup");
  const overlay = document.getElementById("signupsOverlay");
  
  if (popup) {
    popup.remove();
  }
  if (overlay) {
    overlay.remove();
  }
}
