const eventModel = require("../models/eventsModel");

async function getAllEvents(req, res) {
  try {
    const events = await eventModel.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Failed to fetch events." });
  }
}

async function getEventById(req, res) {
  const id = parseInt(req.params.id);
  try {
    const event = await eventModel.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Failed to fetch event." });
  }
}

async function createEvent(req, res) {
  try {
    const newEvent = await eventModel.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Controller error:", error);
    if (error.message && error.message.includes("Invalid time format")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create event." });
  }
}

async function updateEvent(req, res) {
  const id = parseInt(req.params.id);
  try {
    const existingEvent = await eventModel.getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    const updatedEvent = await eventModel.updateEvent(id, req.body);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Controller error:", error);
    if (error.message && error.message.includes("Invalid time format")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error updating event" });
  }
}

async function deleteEvent(req, res) {
  const id = parseInt(req.params.id);
  try {
    const deleted = await eventModel.deleteEvent(id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error when deleting book", error)
    res.status(500).json({ error: "Failed to delete event." });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};