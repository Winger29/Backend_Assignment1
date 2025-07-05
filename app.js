const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config(); 
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

// Update senior
app.put("/seniors/:id", userController.updateSenior);
// Delete senior
app.delete("/seniors/:id", userController.deleteSenior);

// Update staff
app.put("/staff/:id", userController.updateStaff);
// Delete staff
app.delete("/staff/:id", userController.deleteStaff);
app.get("/profile", userController.getProfile);
// Booking routes
app.post("/bookings", bookingController.createBooking); // senior creates booking
app.get("/bookings/senior/:seniorId", bookingController.getBookingsBySenior); // for senior view
app.get("/bookings/clinic/:clinicId", bookingController.getBookingsByClinic); // for staff view
app.put("/bookings/:clinicId/:bookingSeq/status", bookingController.updateBookingStatus); // staff updates status

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