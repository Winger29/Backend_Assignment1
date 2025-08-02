async function searchEvents() {
  const query = document.getElementById("eventSearchInput").value.trim();
  if (!query) return alert("Please enter a search term.");

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/external-events?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const events = await res.json();
    displayEvents(events); // create a function to show them
  } catch (err) {
    console.error("Error fetching events:", err);
    alert("Failed to fetch events.");
  }
}

function displayEvents(events) {
  const container = document.getElementById("eventResults");
  container.innerHTML = "";

  if (!events || events.length === 0) {
    container.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach(e => {
    const div = document.createElement("div");
    div.className = "event-card";
    
    // Format the date and time
    const dateStr = e.date_human_readable || "Date not available";
    // Extract only the date part (before the comma and time)
    const dateOnly = dateStr.split(',')[0] + ', ' + dateStr.split(',')[1];
    const startTime = e.start_time ? new Date(e.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
    const endTime = e.end_time ? new Date(e.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
    const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : startTime || "Time not available";
    const eventLink = e.link || e.url || "#";
    
    div.innerHTML = `
      <h3>${e.name}</h3>
      <p>${e.description || "No description."}</p>
      <p><strong>Date:</strong> ${dateOnly}</p>
      <p><strong>Time:</strong> ${timeStr}</p>
      <a href="${eventLink}" target="_blank" rel="noopener noreferrer">More Info</a>
    `;
    container.appendChild(div);
  });
}
