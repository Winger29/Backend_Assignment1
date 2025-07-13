const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config(); 
const middlewareToken=require("./middlewares/authMiddleware");
const userController= require("./cont rollers/userController");
const eventController = require("./controllers/eventController");
//const bookingController=require("./controllers/bookingController");
const app = express();
const activityRoutes = require('./routes/activityRoutes');
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

// Activity Tracker routes (for elderly)
app.use("/api", activityRoutes); 

// Booking routes
//app.post("/bookings", bookingController.createBooking); // senior creates booking
//app.get("/bookings/senior/:seniorId", bookingController.getBookingsBySenior); // for senior view
//app.get("/bookings/clinic/:clinicId", bookingController.getBookingsByClinic); // for staff view
//app.put("/bookings/:clinicId/:bookingSeq/status", bookingController.updateBookingStatus); // staff updates status

// Events routes
app.get("/events", eventController.getAllEvents);
app.get("/events/:id", eventController.getEventById);

app.post("/events", authMiddleware, eventController.createEvent);
app.put("/events/:id", authMiddleware, eventController.updateEvent);
app.delete("/events/:id", authMiddleware, eventController.deleteEvent);

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