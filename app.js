const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); 
const middlewareToken = require("./middlewares/authMiddleware");
const userController= require("./controllers/userController");
const bookingController=require("./controllers/bookingController");
const clinicController=require("./controllers/clinicController");
const eventController=require("./controllers/eventsController");
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/signup", userController.registerUser);
app.post("/login", userController.login);

app.get("/profile", middlewareToken,userController.getProfile);
app.put("/profile", middlewareToken, userController.updateProfile);
app.delete("/profile", middlewareToken, userController.deleteProfile);

// Booking routes
app.get("/clinics", bookingController.getAllClinics);
app.get("/doctors", bookingController.getDoctorsByClinicId);
app.get("/availability", bookingController.getAvailableSlots);
app.post("/book",middlewareToken, bookingController.createBooking); 
app.get("/my-bookings",middlewareToken,bookingController.getMyBookings);
app.put("/bookings/:clinicId/:bookingDate/:bookingSeq", middlewareToken, bookingController.cancelBooking);
app.put("/bookings/:clinicId/:bookingDate/:bookingSeq/update-time", middlewareToken, bookingController.updateBookingTime);

//Staff management for Booking
app.get("/staff/clinic-bookings", middlewareToken, clinicController.getBookingsForStaff);
app.get("/staff/clinic-info", middlewareToken, clinicController.getClinicInfoForStaff);
app.put("/staff/cancel/:clinicId/:bookingDate/:bookingSeq/:userId", middlewareToken, clinicController.cancelBooking);
app.put("/staff/confirm/:clinicId/:bookingDate/:bookingSeq/:userId", middlewareToken, clinicController.confirmBookingByStaff);

// Events routes
app.get("/events", eventController.getAllEvents);
app.get("/events/:id", eventController.getEventById);
app.post("/events", eventController.createEvent);
app.put("/events/:id", middlewareToken,  eventController.updateEvent);
app.delete("/events/:id", middlewareToken, eventController.deleteEvent);
app.post("/events/signup", middlewareToken, eventController.signupForEvent);

app.listen(port, async () => {
  try {
    await sql.connect(require("./dbConfig"));
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);  
  }
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown on Ctrl+C
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});