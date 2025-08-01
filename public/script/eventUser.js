document.addEventListener("DOMContentLoaded", () => {
  fetchEventsForUser();
});

async function fetchEventsForUser() {
  try {
    const response = await fetch("/events");
    if (!response.ok) throw new Error("Failed to fetch events");

    const events = await response.json();
    displayEvents(events);
  } catch (error) {
    console.error("Error loading events:", error);
    document.getElementById("eventsContainer").innerText = "Failed to load events.";
  }
}

function displayEvents(events) {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";

  events.forEach(event => {

    const dateObj = new Date(event.eventDate);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Organiser:</strong> ${event.organiserName || 'Unknown organiser'}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <button onclick="signUpForEvent(${event.eventId})">Sign Up</button>
    `;
    container.appendChild(div);
  });
}

async function signUpForEvent(eventId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to sign up.");
    return;
  }

  try {
    const response = await fetch("/events/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId }), 
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Signup failed");

    alert("Signed up successfully!");
  } catch (error) {
    console.error("Signup error:", error);
    alert(error.message || "Error signing up");
  }
}
         
