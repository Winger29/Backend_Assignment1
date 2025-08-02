document.getElementById("layout").innerHTML = `
<div class="container">
    <div class="dashboard">
      <h2>Dashboard</h2>
      <p id="totalActivities">🧾 Total Activities: 0</p>
      <p id="totalDuration">⏱️ Total Time Spent: 0 mins</p>
      <p id="lastActivityDate">📅 Last Activity: -</p>

      <div class="history">
        <h2>History of Actions</h2>
        <ul id="historyList" style="max-height: 150px; overflow-y: auto; padding-left: 1rem;"></ul>
      </div>
    </div>

    <div class="mainContent">
      <section class="formSection">
        <h2>Log New Activity</h2>
        <form id="activityForm">
          <label>Activity Name:</label>
          <input type="text" id="activityName" required />
          
          <label>Date:</label>
          <input type="date" id="activityDate" required />
          
          <label>Duration (minutes):</label>
          <input type="number" id="activityDuration" required />

          <label>Notes:</label>
          <textarea id="notes"></textarea>

          <div class="formButtons">
          <button type="submit">Save Activity</button>
          <button type="button" id="cancelEditBtn" style="display:none;">Cancel</button>
          <button type="button" id="deleteBtn" style="display:none;">Delete Activity</button>
          </div>

        </form>
      </section>

      <section class="activityList" id="activityList">
        <!-- Rendered by script.js -->
      </section>
    </div>
  </div>
`;