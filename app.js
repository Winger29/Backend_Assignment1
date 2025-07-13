const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config(); 
const middlewareToken=require("./middlewares/authMiddleware");
const userController= require("./controllers/userController");
const bookingController=require("./controllers/bookingController");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

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