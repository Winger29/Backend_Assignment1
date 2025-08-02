let activities = [];
let editingIndex = null;

function createActivityCard(activity, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <strong>Title:</strong> ${activity.activityName}<br>
    <strong>Duration:</strong> ${activity.duration} mins<br>
    <strong>Date:</strong> ${activity.date.split("T")[0]}<br>
    <strong>Description:</strong> ${activity.notes || '-'}<br>
    <span class="edit" onclick="editActivity(${index})">Edit</span>
  `;
  return card;
}

function renderActivities() {
  const list = document.getElementById('activityList');
  list.innerHTML = '';

    if (activities.length === 0) {
    list.innerHTML = '<p style="font-style: italic; color: #666;">No activity yet. Log new activity now!</p>';
  } else {
    list.innerHTML = '<h2 style="margin-bottom: 1rem;">Activities</h2>';

    activities.forEach((activity, index) => {
    const card = createActivityCard(activity, index);
    list.appendChild(card);
  });
}

  updateDashboard();
}

function updateDashboard() {
  const total = activities.length;
  const totalDuration = activities.reduce((sum, item) => sum + item.duration, 0);

  const lastDate = activities.reduce((latest, act) =>
    new Date(act.date) > new Date(latest) ? act.date : latest,
    activities[0]?.date || '-'
  );

  document.getElementById('totalActivities').textContent = `🧾 Total Activities: ${total}`;
  document.getElementById('totalDuration').textContent = `⏱️ Total Time Spent: ${totalDuration} mins`;
  const formattedDate = lastDate !== '-' ? lastDate.split("T")[0] : '-';
  document.getElementById("lastActivityDate").textContent = `📅 Last Activity: ${formattedDate}`;
}

function editActivity(index) {
  const activity = activities[index];
  console.log(activity); 

  document.getElementById('activityName').value = activity.activityName;
  document.getElementById("activityDate").value = new Date(activity.date).toISOString().split('T')[0];
  document.getElementById('activityDuration').value = activity.duration;
  document.getElementById('notes').value = activity.notes || '';
  editingIndex = index;
  document.getElementById('activityForm').scrollIntoView();

  const deleteBtn = document.getElementById('deleteBtn');
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  deleteBtn.style.display = 'inline-block';
  cancelEditBtn.style.display = "inline-block";
  deleteBtn.onclick = () => confirmDelete(index);
}

function confirmDelete(index) {
  const confirmAction = confirm("Delete this activity? Click 'OK' to confirm.");
  if (confirmAction) {
    const activity = activities[index];
    deleteActivity(activity.id, activity.activityName);
  }
}

async function deleteActivity(id, activityName) {
  try {
    const res = await fetch(`http://localhost:3000/api/activities/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      logHistory(`Deleted an activity: "${activityName}"`);
    } else {
      alert("Error deleting activity.");
    }
  } catch (error) {
    console.error("Failed to delete activity", error);
  }

  await fetchActivities();
  resetForm();
}

function resetForm() {
  document.getElementById('activityForm').reset();
  editingIndex = null;
  document.getElementById('deleteBtn').style.display = 'none';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

async function fetchActivities() {
  try {
    const res = await fetch("http://localhost:3000/api/activities");
    const data = await res.json();
    activities = data;
    renderActivities();
  } catch (error) {
    console.error("Failed to fetch activities", error);
    console.log("Fetched activities:", data); // inside fetchActivities()
  }
}

function getUserId() {
  // Simulate multiple users (for now: 1, 2, or 3)
  return Math.floor(Math.random() * 3) + 1;
}

async function submitActivity(e) {
  e.preventDefault();

  const activity = {
    userId: getUserId(),
    activityName: document.getElementById('activityName').value.trim(),
    date: document.getElementById('activityDate').value,
    duration: parseInt(document.getElementById('activityDuration').value, 10),
    notes: document.getElementById('notes')?.value.trim() || '',
  };

  if (!activity.activityName || !activity.date || !activity.duration) {
    alert("Please complete all required fields.");
    return;
  }

  const url = editingIndex !== null
    ? `http://localhost:3000/api/activities/${activities[editingIndex].id}`
    : "http://localhost:3000/api/activities";

  const method = editingIndex !== null ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activity),
  });

  if (res.ok) {
    const activityName = activity.activityName;

    if (editingIndex !== null) {
    logHistory(`Edited an activity: "${activityName}"`);
  } else {
    logHistory(`Added a new activity: "${activityName}"`);
  }
  } else {
    alert("Error saving activity.");
  }

  await fetchActivities();
  resetForm();
}

function logHistory(message) {
  const historyList = document.getElementById("historyList");
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const listItem = document.createElement("li");
  listItem.textContent = `${message} at ${time}`;

  // Add to the top
  historyList.prepend(listItem);

  // Keep only 5 latest entries
  while (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }
}

cancelEditBtn.addEventListener("click", () => {
  resetForm(); // Clear the form
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("activityForm").addEventListener("submit", submitActivity);
  fetchActivities();
});

document.getElementById('deleteBtn').addEventListener('click', () => {
  if (selectedActivityId && confirm("Delete this activity? Click YES to confirm.")) {
    deleteActivity(selectedActivityId);
  }
});