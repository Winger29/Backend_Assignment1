const clinicsMap = new Map();
const doctorsMap = new Map();


async function loadClinics() {
  try {
    const res = await fetch("/clinics");
    const clinics = await res.json();

    const select = document.getElementById("clinicSearch");
    select.innerHTML = '<option value="">-- Select Clinic --</option>';

    clinics.forEach(clinic => {
    clinicsMap.set(clinic.clinicId, clinic);

    const option = document.createElement("option");
    option.value = clinic.clinicId;
    option.label = `${clinic.clinicName} (${clinic.location})`;
    select.appendChild(option);
    });
  } catch (err) {
    alert("Failed to load clinics",err);
    console.error(err);
  }
}


async function loadDoctorsByClinicId(clinicId) {
  if (!clinicId) return;

  try {
    const res = await fetch(`/doctors?clinicId=${encodeURIComponent(clinicId)}`);
    const doctors = await res.json();

    const select = document.getElementById("doctorSelect");
    select.innerHTML = '<option value="">-- Select Doctor --</option>';
    doctorsMap.clear();

    doctors.forEach(doc => {
      doctorsMap.set(doc.doctorName, doc.doctorId);
      const opt = document.createElement("option");
      opt.value = doc.doctorId;
      opt.textContent = `${doc.doctorName} (${doc.doctorType})`;
      select.appendChild(opt);
    });

    loadTimeSlots(); 
  } catch (err) {
    alert("Failed to load doctors");
    console.error(err);
  }
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


async function loadTimeSlots() {
  const clinicId =  document.getElementById("clinicSearch").value;
  const doctorId = document.getElementById("doctorSelect").value;
  const date = document.getElementById("bookingDate").value;

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("bookingDate").setAttribute("min", today);
  if (!clinicId || !doctorId || !date) return;

  try {
    const res = await fetch(`/availability?clinicId=${clinicId}&doctorId=${doctorId}&date=${date}`);
    const slots = await res.json();

    const select = document.getElementById("timeSlot");
    select.innerHTML = "";
    slots.forEach(slot => {
    const isoTime = new Date(slot.availableTime).toISOString();
    const rawTime = isoTime.split("T")[1].split("Z")[0]; 
    const [hours, minutes] = rawTime.split(":");
    const sqlTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`; 

    const opt = document.createElement("option");
    opt.value = sqlTime;  
    opt.textContent = formatTime(sqlTime);  
      select.appendChild(opt);
    });
  } catch (err) {
    alert("Failed to load time slots");
    console.error(err);
  }
}


async function submitBookingForm(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  const clinicId =  document.getElementById("clinicSearch").value;
  const bookingData = {
    clinicId,
    doctorId: document.getElementById("doctorSelect").value,
    bookingDate: document.getElementById("bookingDate").value,
    appointmentTime: document.getElementById("timeSlot").value,
    phone: document.getElementById("phone").value,
    type: document.getElementById("reason").value
  };

  try {
    const res = await fetch("/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });

    const result = await res.json();
    if (res.ok) {
      alert("Booking successful! Sequence #" + result.bookingSeq);
    } else {
      alert("Booking failed: " + result.error);
    }
  } catch (err) {
    alert("Error creating booking");
    console.error(err);
  }
}

function showTab(tabId) {
  
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.style.display = "none";
  });

  
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.classList.remove("active");
  });

  
  document.getElementById(tabId).style.display = "block";

  
  const tabButton = Array.from(document.querySelectorAll(".tab-button"))
    .find(btn => btn.getAttribute("onclick")?.includes(tabId));
  if (tabButton) tabButton.classList.add("active");

  
  if (tabId === "myBookings") {
    loadMyBookings();
  } else if (tabId === "bookingHistory") {
    loadBookingHistory();
  }
}

async function loadMyBookings() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    return;
  }

  try {
    const res = await fetch("/my-bookings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const bookings = await res.json();
    const container = document.getElementById("myBookingCards");
    container.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];

    
    const upcoming = bookings.filter(b => 
      b.status.toLowerCase() !== "cancelled" && b.bookingDate >= today
    );

    if (!Array.isArray(upcoming) || upcoming.length === 0) {
      container.innerHTML = "<p>No upcoming bookings found.</p>";
      return;
    }

    upcoming.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card";
      const statusClass = b.status.toLowerCase();
      const bookingDate = new Date(b.bookingDate).toLocaleDateString("en-SG", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });

      const rawTime = b.appointmentTime.replace("Z", ""); 
      const appointmentTime = new Date(rawTime).toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }); 
  
      card.innerHTML = `
        <h4>📅 ${bookingDate} ⏰ ${appointmentTime}</h4>
        <p><strong>🏥 Clinic:</strong> ${b.clinicName}</p>
        <p><strong>👨‍⚕️ Doctor:</strong> ${b.doctorName}</p>
        <p><strong>Status:</strong> <span class="status ${statusClass}">${b.status}</span></p>
        <div class="card-buttons">
            <button onclick="editBooking('${b.clinicId}', '${b.bookingDate}', ${b.bookingSeq})">✏️ Update</button>
            <button onclick="deleteBooking('${b.clinicId}', '${b.bookingDate}', ${b.bookingSeq})">🗑️ Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load bookings:", err);
    alert("Could not load your bookings.");
  }
}



function openBookingPopup() {
    document.getElementById("bookingPopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

  
function closeBookingPopup() {
    document.getElementById("bookingPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function resetForm() {
    form.reset();
    doctorSelect.innerHTML = `<option value="">-- Select Doctor --</option>`;
    slotSelect.innerHTML = `<option value="">-- Select Time --</option>`;
}

async function deleteBooking(clinicId, bookingDate, bookingSeq) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please log in first.");

  const confirmDelete = confirm("Are you sure you want to cancel this booking?");
  if (!confirmDelete) return;
  const dateOnly = bookingDate.split("T")[0];
  try {
    const res = await fetch(`/bookings/${clinicId}/${dateOnly}/${bookingSeq}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await res.json();
    if (res.ok) {
      alert("Booking has been cancelled.");
      loadMyBookings();
    } else {
      alert("Cancel failed: " + result.error);
    }
  } catch (err) {
    console.error("Cancel error:", err);
    alert("Error cancelling booking");
  }
}

async function loadBookingHistory() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    return;
  }

  try {
    const res = await fetch("/my-bookings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const bookings = await res.json();
    const container = document.getElementById("bookingHistoryCards");
    container.innerHTML = "";

    const today = new Date();
    const history = bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      const isPast = bookingDate < today;
      const isCancelled = b.status?.toLowerCase() === "cancelled";
      return isPast || isCancelled;
    });

    console.log("History bookings:", history);

    if (!Array.isArray(history) || history.length === 0) {
      container.innerHTML = "<p>No booking history found.</p>";
      return;
    }

    history.forEach(b => {
      const card = document.createElement("div");
      card.className = "booking-card";
      const statusClass = b.status.toLowerCase();
      const bookingDate = new Date(b.bookingDate).toLocaleDateString("en-SG", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
        const rawTime = b.appointmentTime.replace("Z", ""); 
        const appointmentTime = new Date(rawTime).toLocaleTimeString("en-SG", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }); 
  
      card.innerHTML = `
        <h4>${bookingDate} at ${appointmentTime}</h4>
        <p><strong>Clinic:</strong> ${b.clinicName}</p>
        <p><strong>Doctor:</strong> ${b.doctorName}</p>
        <p><strong>Status:</strong><span class="status ${statusClass}">${b.status}</span></p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load booking history:", err);
    alert("Could not load booking history.");
  }
}

async function editBooking(clinicId, bookingDate, bookingSeq) {
  
  localStorage.setItem("editClinicId", clinicId);
  localStorage.setItem("editBookingDate", bookingDate);
  localStorage.setItem("editBookingSeq", bookingSeq);

  
  document.getElementById("editBookingPopup").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  await loadEditTimeSlots(clinicId, bookingDate, bookingSeq); 
}


async function loadEditTimeSlots(clinicId, bookingDate, bookingSeq) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    
    const bookings = await fetch("/my-bookings", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());

    const thisBooking = bookings.find(
      b => b.clinicId === clinicId &&
           b.bookingDate === bookingDate &&
           b.bookingSeq === parseInt(bookingSeq)
    );

    if (!thisBooking) {
      alert("Booking not found.");
      return;
    }

    const doctorId = thisBooking.doctorId;

    
    const res = await fetch(`/availability?clinicId=${clinicId}&doctorId=${doctorId}&date=${bookingDate}`);
    const slots = await res.json();

    const select = document.getElementById("editTimeSlot");
    select.innerHTML = '<option value="">-- Select New Time --</option>';

    if (!slots || slots.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "No available time slots";
      opt.disabled = true;
      select.appendChild(opt);
      return;
    }

    slots.forEach(slot => {
      const opt = document.createElement("option");
      const time = new Date(slot.availableTime).toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      opt.value = slot.availableTime;
      opt.textContent = time;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Failed to load time slots", err);
    alert("Unable to load available slots.");
  }
}

function submitEditBooking() {
  const newTime = document.getElementById("editTimeSlot").value;

  const clinicId = localStorage.getItem("editClinicId");
  const bookingDate = localStorage.getItem("editBookingDate");
  const bookingSeq = localStorage.getItem("editBookingSeq");

  const token = localStorage.getItem("token");
  if (!token || !clinicId || !bookingDate || !bookingSeq || !newTime) {
    alert("Missing required data for update.");
    return;
  }

  fetch(`/bookings/${clinicId}/${bookingDate}/${bookingSeq}/update-time`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ appointmentTime: newTime })
  })
  .then(res => res.json())
  .then(result => {
    if (result.message) {
      alert("Booking updated successfully.");
      closeEditPopup();
      loadMyBookings(); 
    } else {
      alert("Failed to update booking: " + result.error);
    }
  })
  .catch(err => {
    console.error("Update failed:", err);
    alert("Something went wrong while updating.");
  });
}

function closeEditPopup() {
  document.getElementById("editBookingPopup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  localStorage.removeItem("editClinicId");
  localStorage.removeItem("editBookingDate");
  localStorage.removeItem("editBookingSeq");
  document.getElementById("editTimeSlot").innerHTML = '<option value="">-- Select New Time --</option>';
}




document.addEventListener("DOMContentLoaded", () => {
  loadClinics();
  document.getElementById("openBookingBtn").addEventListener("click", openBookingPopup);

  document.getElementById("clinicSearch").addEventListener("change", (e) => {
    const clinicId = e.target.value;
    if (clinicId) {
      loadDoctorsByClinicId(clinicId);
    }
});
  document.getElementById("bookingForm").reset();
  closeBookingPopup();
  document.getElementById("bookingDate").addEventListener("change", loadTimeSlots);
  document.getElementById("doctorSelect").addEventListener("change", loadTimeSlots);
  document.getElementById("bookingForm").addEventListener("submit", submitBookingForm);
});


