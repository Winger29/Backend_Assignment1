document.addEventListener("DOMContentLoaded", () => {
  fetchMyEvents();
});

async function fetchMyEvents() {
  const token = localStorage.getItem("token");
  if (!token) {
    document.getElementById("myEventsContainer").innerText = "Please log in to view your events.";
    return;
  }

  try {
    const response = await fetch("/my-events", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        document.getElementById("myEventsContainer").innerText = "Please log in to view your events.";
        return;
      }
      throw new Error("Failed to fetch my events");
    }

    const events = await response.json();
    displayMyEvents(events);
  } catch (error) {
    console.error("Error loading my events:", error);
    document.getElementById("myEventsContainer").innerText = "Failed to load your events.";
  }
}

function displayMyEvents(events) {
  const container = document.getElementById("myEventsContainer");
  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = `
      <div class="no-events">
        <h3>No Events Found</h3>
        <p>You haven't signed up for any events yet.</p>
        <a href="eventUser.html">Browse Events</a>
      </div>
    `;
    return;
  }

  events.forEach(event => {
    const dateObj = new Date(event.eventDate);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const div = document.createElement("div");
    div.className = "event-card my-event-card";
    div.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Organiser:</strong> ${event.organiserName || 'Unknown organiser'}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <div class="event-actions">
        <button onclick="viewEventDetails(${event.eventId})" class="btn-secondary">View Details</button>
        <button onclick="cancelSignup(${event.eventId})" class="btn-danger">Cancel Signup</button>
      </div>
    `;
    container.appendChild(div);
  });
}

async function viewEventDetails(eventId) {
  try {
    const response = await fetch(`/events/${eventId}`);
    if (!response.ok) throw new Error("Failed to fetch event details");
    
    const event = await response.json();
    
    // Show event details in a modal or redirect to event details page
    alert(`Event Details:\nTitle: ${event.title}\nDate: ${event.eventDate}\nTime: ${event.startTime} - ${event.endTime}\nLocation: ${event.location}`);
  } catch (error) {
    console.error("Error fetching event details:", error);
    alert("Failed to load event details");
  }
}

async function cancelSignup(eventId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to cancel your signup.");
    return;
  }

  if (!confirm("Are you sure you want to cancel your signup for this event?")) {
    return;
  }

  try {
    const response = await fetch(`/events/${eventId}/cancel-signup`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to cancel signup");
    }

    alert("Signup cancelled successfully!");
    // Refresh the events list
    fetchMyEvents();
  } catch (error) {
    console.error("Error cancelling signup:", error);
    alert(error.message || "Error cancelling signup");
  }
}
