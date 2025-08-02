const eventModel = require("../models/eventsModel");
const signupModel = require("../models/signupModel");
const myEventsModel = require("../models/myEventsModel");

async function getAllEvents(req, res) {
  try {
    const events = await eventModel.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events." });
  }
}

async function getEventById(req, res) {
  const id = parseInt(req.params.id);
  try {
    const event = await eventModel.getEventById(id);
    if (!event) return res.status(404).json({ error: "Event not found." });
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event." });
  }
}

async function createEvent(req, res) {
  try {
    const newEvent = await eventModel.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    if (error.message.includes("Invalid time format")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create event." });
  }
}

async function updateEvent(req, res) {
  const id = parseInt(req.params.id);
  const userRole = req.user?.role;
  const userId = req.user?.id;
  
  try {
    const existing = await eventModel.getEventById(id);
    if (!existing) return res.status(404).json({ error: "Event not found" });

    // Check authorization for organisers
    if (userRole === "organiser") {
      const isOwner = await eventModel.isEventOwnedByOrganiser(id, userId);
      if (!isOwner) {
        return res.status(403).json({ error: "You can only edit events you created" });
      }
      // Remove organiserId from request body to prevent changing ownership
      delete req.body.organiserId;
    }

    const updated = await eventModel.updateEvent(id, req.body, userRole === "organiser" ? userId : null);
    if (!updated) {
      return res.status(404).json({ error: "Event not found or you don't have permission to edit it" });
    }
    
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    if (error.message.includes("Invalid time format")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error updating event" });
  }
}

async function deleteEvent(req, res) {
  const id = parseInt(req.params.id);
  const userRole = req.user?.role;
  const userId = req.user?.id;
  
  try {
    // Check authorization for organisers
    if (userRole === "organiser") {
      const isOwner = await eventModel.isEventOwnedByOrganiser(id, userId);
      if (!isOwner) {
        return res.status(403).json({ error: "You can only delete events you created" });
      }
    }

    const deleted = await eventModel.deleteEvent(id, userRole === "organiser" ? userId : null);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found or you don't have permission to delete it" });
    }
    
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event." });
  }
}

async function signupForEvent(req, res) {
  const seniorId = req.user?.id;
  const eventId = req.body.eventId || req.body.eventid;

  console.log("Signing up for event with seniorId:", seniorId, "and eventId:", eventId);

  if (!eventId) {
    return res.status(400).json({ error: "Missing eventId" });
  }

  try {
    const exists = await signupModel.getSignup(seniorId, eventId);
    if (exists) {
      return res.status(409).json({ error: "Already signed up for this event" });
    }

    const newSignup = await signupModel.addSignup(seniorId, eventId);
    res.status(201).json({ message: "Signed up successfully", signup: newSignup });
  } catch (error) {
    console.error("Error signing up for event:", error);
    res.status(500).json({ error: "Failed to sign up for event" });
  }
}

async function getEventSignups(req, res) {
  const eventId = parseInt(req.params.eventId);
  
  try {
    const signups = await signupModel.getEventSignups(eventId);
    res.status(200).json({
      eventId: eventId,
      totalAttendees: signups.length,
      signups: signups
    });
  } catch (error) {
    console.error("Error fetching event signups:", error);
    res.status(500).json({ error: "Failed to fetch event signups" });
  }
}

async function getMyEvents(req, res) {
  const seniorId = req.user?.id;
  
  if (!seniorId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const events = await myEventsModel.getMyEvents(seniorId);
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching my events:", error);
    res.status(500).json({ error: "Failed to fetch my events" });
  }
}

async function cancelSignup(req, res) {
  const seniorId = req.user?.id;
  const eventId = parseInt(req.params.eventId);

  if (!seniorId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (!eventId) {
    return res.status(400).json({ error: "Missing eventId" });
  }

  try {
    const cancelled = await myEventsModel.cancelSignup(seniorId, eventId);
    if (!cancelled) {
      return res.status(404).json({ error: "Signup not found or already cancelled" });
    }
    
    res.status(200).json({ message: "Signup cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling signup:", error);
    res.status(500).json({ error: "Failed to cancel signup" });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  signupForEvent,
  getEventSignups,
  getMyEvents,
  cancelSignup,
};