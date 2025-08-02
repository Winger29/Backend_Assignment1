const { fetchRapidEvents } = require("../models/externalApiModel");

async function getFormattedEvents(req, res) {
  const query = req.query.q || "health"; 
  try {
    const events = await fetchRapidEvents(query);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to load events" });
  }
}

module.exports = { getFormattedEvents };
