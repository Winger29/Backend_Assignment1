document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventsContainer");

  // Create form element
  const form = document.createElement("form");
  form.id = "createEventForm";

  // Apply outline container styles
  form.style.maxWidth = "500px";
  form.style.margin = "20px auto";
  form.style.padding = "25px";
  form.style.border = "2px solid #e46f39";
  form.style.borderRadius = "8px";
  form.style.backgroundColor = "#f9faff";
  form.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  form.style.fontFamily = "Arial, sans-serif";

  // Title header
  const heading = document.createElement("h2");
  heading.textContent = "Create Event";
  heading.style.marginBottom = "20px";
  heading.style.color = "#333";
  heading.style.textAlign = "center";
  heading.style.fontWeight = "600";
  form.appendChild(heading);

  // Helper to create labeled input groups
  function createFormGroup(labelText, inputType, inputName, isTextarea = false) {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "15px";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";

    const label = document.createElement("label");
    label.htmlFor = inputName;
    label.textContent = labelText;
    label.style.marginBottom = "5px";
    label.style.fontWeight = "500";
    label.style.color = "#222";

    let input;
    if (isTextarea) {
      input = document.createElement("textarea");
      input.rows = 3;
      input.style.resize = "vertical";
    } else {
      input = document.createElement("input");
      input.type = inputType;
    }
    input.name = inputName;
    input.id = inputName;
    input.required = true;
    input.style.padding = "8px 10px";
    input.style.border = "1.5px solid #ccc";
    input.style.borderRadius = "5px";
    input.style.fontSize = "1rem";
    input.style.transition = "border-color 0.3s ease";

    input.addEventListener("focus", () => {
      input.style.borderColor = "#e46f39";
      input.style.outline = "none";
      input.style.backgroundColor = "#fff";
    });
    input.addEventListener("blur", () => {
      input.style.borderColor = "#ccc";
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }

  // Append all fields:
  form.appendChild(createFormGroup("Event Title:", "text", "title"));
  form.appendChild(createFormGroup("Description:", "text", "description", true));
  form.appendChild(createFormGroup("Location:", "text", "location"));
  form.appendChild(createFormGroup("Date:", "text", "date"));
  form.appendChild(createFormGroup("Start Time:", "text", "startTime"));
  form.appendChild(createFormGroup("End Time:", "text", "endTime"));

  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Create Event";
  submitBtn.style.backgroundColor = "#e46f39";
  submitBtn.style.color = "white";
  submitBtn.style.fontWeight = "600";
  submitBtn.style.padding = "12px";
  submitBtn.style.width = "100%";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "6px";
  submitBtn.style.cursor = "pointer";
  submitBtn.style.transition = "background-color 0.3s ease";
  submitBtn.style.marginTop = "10px";
  submitBtn.addEventListener("mouseover", () => {
    submitBtn.style.backgroundColor = "#e46f39";
  });
  submitBtn.addEventListener("mouseout", () => {
    submitBtn.style.backgroundColor = "#e46f39";
  });
  form.appendChild(submitBtn);

  // Status message div
  const statusMsg = document.createElement("div");
  statusMsg.id = "statusMsg";
  statusMsg.style.marginTop = "15px";
  statusMsg.style.fontWeight = "600";
  statusMsg.style.textAlign = "center";
  form.appendChild(statusMsg);

  // Add form to container
  container.innerHTML = "";
  container.appendChild(form);

flatpickr("#date", { dateFormat: "Y-m-d" });
flatpickr("#startTime", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true });
flatpickr("#endTime", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true });


  // Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const formData = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      location: form.location.value.trim(),
      eventDate: form.date.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
      organiserId: localStorage.getItem("userId") || "ORG001" // or however you get organiserId
    };

    // Basic time validation
    if (!isEndTimeValid(formData.startTime, formData.endTime)) {
      statusMsg.textContent = "❌ End time must be later than start time.";
      statusMsg.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        statusMsg.textContent = "✅ Event created successfully!";
        statusMsg.style.color = "green";
        form.reset();
      } else {
        statusMsg.textContent = `❌ ${data.error || data.message || "Error creating event"}`;
        statusMsg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      statusMsg.textContent = "❌ Network error. Try again.";
      statusMsg.style.color = "red";
    }
  });

  // Time validation function
  function isEndTimeValid(startTime, endTime) {
    if (!startTime || !endTime) return false;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return eh > sh || (eh === sh && em > sm);
  }
});
