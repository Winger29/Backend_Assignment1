const bookingModel = require("../models/bookingModel");


async function getAllClinics(req, res) {
  try {
    const clinics = await bookingModel.getAllClinics();
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clinics" });
  }
}


async function getDoctorsByClinicId(req, res) {
  const { clinicId } = req.query;
  if (!clinicId) {
    return res.status(400).json({ error: "clinicId is required" });
  }

  try {
    const doctors = await bookingModel.getDoctorsByClinicId(clinicId);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors for clinic" });
  }
}


async function getAvailableSlots(req, res) {
  const { clinicId, doctorId, date } = req.query;
  if (!clinicId || !doctorId || !date) {
    return res.status(400).json({ error: "clinicId, doctorId, and date are required" });
  }

  const weekday = new Date(date).toLocaleString("en-US", { weekday: "long" }); 

  try {
    const slots = await bookingModel.getAvailableTimeSlots(clinicId, doctorId, weekday);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch time slots" });
  }
}


async function createBooking(req, res) {
  const userId = req.user?.id; 
  const {
    clinicId,
    doctorId,
    bookingDate,
    appointmentTime,
    phone,
    type
  } = req.body;

  if (!userId || !clinicId || !doctorId || !bookingDate || !appointmentTime || !phone || !type) {
    return res.status(400).json({ error: "Missing required booking fields" });
  }

  
  const today = new Date().toISOString().split("T")[0];
  if (bookingDate < today) {
    return res.status(400).json({ error: "Cannot book past dates" });
  }

  try {
    const conflict = await bookingModel.checkExistingBooking({
      clinicId,
      doctorId,
      bookingDate,
      appointmentTime,
      userId
    });

    if (conflict) {
      return res.status(400).json({
        error: "You already have a booking at this time for this clinic and doctor."
      });
    }
    const result = await bookingModel.createBooking({
      clinicId,
      doctorId,
      bookingDate,
      appointmentTime,
      userId,
      phone,
      type,
      status: "pending"
    });

    res.status(201).json({
      message: "Booking created successfully",
      bookingSeq: result.bookingSeq
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking" });
  }
}

async function getMyBookings(req, res) {
  const { id, role } = req.user;

  if (role !== "senior") {
    return res.status(403).json({ error: "Only seniors can view their bookings" });
  }

  try {
    const bookings = await bookingModel.fetchBookingsBySeniorId(id);
    res.json(bookings);
  } catch (err) {
    console.error("getMyBookings() controller error:", err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
}

async function cancelBooking(req, res) {
  const { clinicId, bookingDate, bookingSeq } = req.params;
  const { id: userId, role } = req.user;

  if (role !== "senior") {
    return res.status(403).json({ error: "Only seniors can cancel their bookings" });
  }

  try {
    await bookingModel.cancelBooking(clinicId, bookingDate, parseInt(bookingSeq), userId);
    res.json({ message: "Booking successfully cancelled" });
  } catch (err) {
    console.error("cancelBooking controller error:", err);
    res.status(500).json({ error: "Unable to cancel booking" });
  }
}

async function updateBookingTime(req, res) {
  const { clinicId, bookingDate, bookingSeq } = req.params;
  const { appointmentTime } = req.body;
  const { id: userId, role } = req.user;

  if (role !== "senior") {
    return res.status(403).json({ error: "Only seniors can update their bookings" });
  }

  if (!appointmentTime) {
    return res.status(400).json({ error: "New appointment time required" });
  }

  try {
    const result = await bookingModel.updateBookingTime(
      clinicId,
      bookingDate,
      parseInt(bookingSeq),
      userId,
      appointmentTime
    );

    res.json({
      message: "Booking time updated successfully",
      newTime: appointmentTime
    });

  } catch (err) {
    console.error("updateBookingTime controller error:", err);

    
    if (err.message.includes("not available")) {
      return res.status(400).json({ error: err.message });
    }

    
    res.status(500).json({ error: "Unable to update booking time" });
  }
}

module.exports = {
  getAllClinics,
  getDoctorsByClinicId,
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBookingTime
};
