const Joi = require("joi");

// ========= Joi Schemas =========

// 1. Booking creation
const bookingSchema = Joi.object({
  clinicId: Joi.string().required().messages({
    "any.required": "Clinic ID is required"
  }),
  doctorId: Joi.string().required().messages({
    "any.required": "Doctor ID is required"
  }),
  bookingDate: Joi.date().iso().required().messages({
    "any.required": "Booking date is required",
    "date.base": "Booking date must be a valid ISO date"
  }),
  appointmentTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):00$/).required().messages({
    "string.pattern.base": "Appointment time must be in HH:MM:00 format",
    "any.required": "Appointment time is required"
  }),
  phone: Joi.string().pattern(/^\d{8}$/).messages({
    "string.pattern.base": "Phone must be 8 digits"
  }),
  type: Joi.string().min(1).max(255).required().messages({
    "any.required": "Booking reason is required",
    "string.empty": "Booking reason cannot be empty"
  })
});

// 2. Time update
const timeUpdateSchema = Joi.object({
  appointmentTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):00$/).required().messages({
    "string.pattern.base": "Appointment time must be in HH:MM:00 format",
    "any.required": "New appointment time is required"
  })
});

// ========= Middlewares =========

// Validate booking body (POST /book)
function validateBooking(req, res, next) {
  const { error } = bookingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(e => e.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

// Validate appointmentTime for time update (PUT /bookings/:.../update-time)
function validateTimeUpdate(req, res, next) {
  const { error } = timeUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(e => e.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

// Optional: Validate path params like clinicId, date, and bookingSeq
function validateBookingParams(req, res, next) {
  const { clinicId, bookingDate, bookingSeq } = req.params;

  if (!clinicId || !bookingDate || isNaN(bookingSeq) || parseInt(bookingSeq) <= 0) {
    return res.status(400).json({
      error: "Invalid clinicId, bookingDate or bookingSeq in URL"
    });
  }

  next();
}

module.exports = {
  validateBooking,
  validateTimeUpdate,
  validateBookingParams
};
