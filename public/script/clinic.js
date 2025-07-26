document.addEventListener("DOMContentLoaded", () => {
  loadClinicInfoAndDoctors();
  fetchClinicBookings();
});

function updateBookingStats(bookings) {
  const todayStr = new Date().toISOString().split("T")[0];

  const today = bookings.filter(b => b.bookingDate.startsWith(todayStr) && b.status === "confirmed");
  const pending = bookings.filter(b => b.status === "pending");
  const thisWeek = bookings.filter(b => {
    const date = new Date(b.bookingDate);
    const now = new Date();
    const diff = (date - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && b.status === "confirmed";
  });

  document.getElementById("pendingCount").textContent = pending.length;
  document.getElementById("todayCount").textContent = today.length;
  document.getElementById("weekCount").textContent = thisWeek.length;
}

async function fetchClinicBookings() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/staff/clinic-bookings", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server error response:", errorText);
      return alert("Failed to load bookings: " + res.status);
    }

    const data = await res.json();

    updateBookingStats(data.bookings || data);  
  } catch (err) {
    console.error("fetchClinicBookings error:", err);
    alert("Error: Could not connect to server.");
  }
}


function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderBookingTable(data, showFilters) {
  const container = document.getElementById("bookingTableContainer");
  const tbody = document.querySelector("#bookingTable tbody");
  const filterControls = document.getElementById("filterControls");

  container.classList.remove("hidden");
  tbody.innerHTML = "";
  filterControls.classList.toggle("hidden", !showFilters);

  data.forEach(b => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${b.seniorName}</td>
      <td>${b.doctorName}</td>
      <td>${formatDate(b.bookingDate)}</td>
      <td>${b.appointmentTime}</td>
      <td>${b.phone}</td>
      <td>${b.type}</td>
      <td>${b.status}</td>
      <td>
        ${b.status === "pending"
          ? `<button onclick="confirmBooking('${b.clinicId}', '${b.bookingDate}', ${b.bookingSeq}, '${b.userId}')">✅</button>
             <button onclick="cancelBooking('${b.clinicId}', '${b.bookingDate}', ${b.bookingSeq}, '${b.userId}')">❌</button>`
          : `—`}
      </td>
    `;
    tbody.appendChild(row);
  });

  if (showFilters) populateDoctorFilter(data);
}

function formatDateParam(dateStr) {
  return new Date(dateStr).toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-SG", {
    year: "numeric", month: "short", day: "numeric"
  });
}

function formatTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return "Invalid Time";

  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return "Invalid Time";

  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

async function cancelBooking(clinicId, bookingDate, bookingSeq, userId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/staff/bookings/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ clinicId, bookingDate, bookingSeq, userId })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Booking deleted successfully");
      fetchClinicBookings(); // Refresh table
    } else {
      alert(data.error || "Failed to delete booking");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function fetchDoctorsForClinic() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/staff/doctors", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const doctors = await res.json();
    if (res.ok) {
      renderDoctorsTable(doctors);
    } else {
      alert(doctors.error || "Failed to load doctors");
    }
  } catch (err) {
    console.error("fetchDoctorsForClinic error:", err);
    alert("Error: " + err.message);
  }
}

function renderDoctorsTable(doctors) {
  const doctorSection = document.getElementById("doctorSection");
  const bookingSection = document.getElementById("bookingSection");
  const tbody = document.getElementById("doctorBody");

  doctorSection.style.display = "block";
  bookingSection.style.display = "none";
  tbody.innerHTML = "";

  // Group rows by doctorId if needed
  doctors.forEach(doc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${doc.doctorName}</td>
      <td>${doc.doctorType}</td>
      <td>${doc.availableDay}</td>
      <td>${formatTime(doc.availableTime)}</td>
    `;
    tbody.appendChild(row);
  });
}

function showBookingSection() {
  document.getElementById("bookingSection").style.display = "block";
  document.getElementById("doctorSection").style.display = "none";
  fetchClinicBookings(); // Refresh if needed
}

async function loadClinicInfoAndDoctors() {
  const token = localStorage.getItem("token");
try {
  const res = await fetch("/staff/clinic-info", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const contentType = res.headers.get("content-type") || "";
if (!res.ok || !contentType.includes("application/json")) {
  const text = await res.text();
  console.error("Unexpected response:", text);
  return alert("Failed to load clinic info (invalid response)");
}
const data = await res.json();

    const nameEl = document.getElementById("clinicName");
    const locEl = document.getElementById("clinicLocation");
    const list = document.getElementById("doctorList");

    if (!nameEl || !locEl || !list) {
      console.warn("Some DOM elements are missing");
      return;
    }

    nameEl.textContent = data.clinic?.clinicName || "-";
    locEl.textContent = data.clinic?.location || "-";

    list.innerHTML = "";

    if (data.doctors?.length) {
      data.doctors.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = `${doc.doctorName} (${doc.doctorType}) - ${doc.availableDay} ${formatTime(doc.availableTime)}`;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>No doctors assigned yet</li>";
    }

  } catch (err) {
    console.error("loadClinicInfoAndDoctors error:", err);
    alert("Error loading clinic info.");
  }
}

function showBookingSection(bookings, isConfirmedView) {
  document.getElementById("mainContent").classList.add("hidden");
  document.getElementById("bookingTableContainer").classList.remove("hidden");
  renderBookingTable(bookings, isConfirmedView);
}

function backToDashboard() {
  document.getElementById("mainContent").classList.remove("hidden");
  document.getElementById("bookingTableContainer").classList.add("hidden");
}

async function showPendingBookings() {
  const res = await fetch("/staff/clinic-bookings", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  const bookings = await res.json();
  const pending = bookings.filter(b => b.status === "pending");
  showBookingSection(pending, false);
}

async function showConfirmedBookings() {
  const res = await fetch("/staff/clinic-bookings", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  const bookings = await res.json();
  const confirmed = bookings.filter(b => b.status === "confirmed");
  showBookingSection(confirmed, true);
}

function populateDoctorFilter(bookings) {
  const doctorSelect = document.getElementById("doctorFilter");
  const doctors = [...new Set(bookings.map(b => b.doctorName))];

  doctorSelect.innerHTML = `<option value="">All Doctors</option>`;
  doctors.forEach(doc => {
    doctorSelect.innerHTML += `<option value="${doc}">${doc}</option>`;
  });
}

function applyFilters() {
  const nameQuery = document.getElementById("searchInput").value.toLowerCase();
  const selectedDoctor = document.getElementById("doctorFilter").value;
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  fetch("/staff/clinic-bookings", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(bookings => {
      let filtered = bookings.filter(b => b.status === "confirmed");

      if (nameQuery) {
        filtered = filtered.filter(b => b.seniorName.toLowerCase().includes(nameQuery));
      }
      if (selectedDoctor) {
        filtered = filtered.filter(b => b.doctorName === selectedDoctor);
      }
      if (start) {
        filtered = filtered.filter(b => new Date(b.bookingDate) >= new Date(start));
      }
      if (end) {
        filtered = filtered.filter(b => new Date(b.bookingDate) <= new Date(end));
      }

      renderBookingTable(filtered, true);
    });
}

async function confirmBooking(clinicId, bookingDate, bookingSeq, userId) {
  await fetch(`/staff/confirm/${clinicId}/${bookingDate}/${bookingSeq}/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  showPendingBookings();
}

