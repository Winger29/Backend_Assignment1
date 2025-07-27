const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const cors = require("cors");


dotenv.config(); 
const middlewareToken=require("./middlewares/authMiddleware");
const userController= require("./controllers/userController");
const bookingController=require("./controllers/bookingController");
const clinicController=require("./controllers/clinicController");
const groupController = require("./controllers/groupController");
const app = express();
const port = process.env.PORT || 3000;


const authenticateToken = require("./middleware/jwtTransfer");
app.use(cors());
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
// app.post("/bookings", bookingController.createBooking); // senior creates booking
// app.get("/bookings/senior/:seniorId", bookingController.getBookingsBySenior); // for senior view
// app.get("/bookings/clinic/:clinicId", bookingController.getBookingsByClinic); // for staff view
// app.put("/bookings/:clinicId/:bookingSeq/status", bookingController.updateBookingStatus); // staff updates status

// get Groupchats
app.post("/groupchat",authenticateToken.authenticateToken,groupController.createGroup);
app.get("/groupchat", groupController.getAllGroups); 
app.get("/usergroupchat", authenticateToken.authenticateToken, groupController.getGroupByUser);
app.get("/groupchat/:name", groupController.getGroupByName);
app.put("/groupchat/:id", groupController.updateGroup);
app.delete("/groupchat/:id", groupController.deleteGroup);


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