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
      div.id = `event-${event.eventId}`;

      div.innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Date:</strong> ${formatDate(event.eventDate)}</p>
        <p><strong>Time:</strong> ${event.startTime} – ${event.endTime}</p>
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
    const res = await fetch(`/events/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete event");
    fetchEvents()
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
