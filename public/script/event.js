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

    events.forEach(event => {
      const div = document.createElement("div");
      div.classList.add("event-card");

      div.innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Date:</strong> ${event.eventDate}</p>
        <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <button onclick="deleteEvent(${event.eventId})">Delete</button>
        <button onclick='showEditForm(${JSON.stringify(event)})'>Edit</button>
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

  try {
    const res = await fetch(`/events/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete event");
    fetchEvents(); // Refresh the list
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete event.");
  }
}

function showEditForm(event) {
  const container = document.getElementById("eventsContainer");

  const form = document.createElement("form");
  form.innerHTML = `
    <h3>Edit Event: ${event.title}</h3>
    <label>Title: <input name="title" value="${event.title}" /></label><br/>
    <label>Date: <input type="date" name="eventDate" value="${event.eventDate}" /></label><br/>
    <label>Start Time: <input type="time" name="startTime" value="${event.startTime}" /></label><br/>
    <label>End Time: <input type="time" name="endTime" value="${event.endTime}" /></label><br/>
    <label>Location: <input name="location" value="${event.location}" /></label><br/>
    <button type="submit">Save</button>
    <button type="button" onclick="fetchEvents()">Cancel</button>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const updated = {
      title: formData.get("title"),
      eventDate: formData.get("eventDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      location: formData.get("location"),
      organiserId: event.organiserId // reuse existing
    };

    try {
      const res = await fetch(`/events/${event.eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      if (!res.ok) throw new Error("Failed to update event");
      fetchEvents();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update event.");
    }
  };

  container.innerHTML = "";
  container.appendChild(form);
}
