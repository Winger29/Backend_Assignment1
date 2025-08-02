const express = require('express');
const app = express();
const path = require('path');

const routes = require('./public/routes/activityRoutes');

app.use(express.json());  // Parse JSON bodies
app.use(express.static('public')); // ✅ Serve files from the 'public' folder (including activities.html)

app.use('/api', routes); // API routes

app.get('/', (req, res) => {
  res.send('Activity Tracker API is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
