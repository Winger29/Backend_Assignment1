const path = require("path");
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const middlewareToken = require("./middlewares/authMiddleware");
const userController = require("./controllers/userController");
const bookingController = require("./controllers/bookingController");
const clinicController = require("./controllers/clinicController");
const groupController = require("./controllers/groupController");
const msgController = require("./controllers/messageController");

const app = express();
const server = http.createServer(app); // 👈 Create HTTP server from Express
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production if needed
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Auth & Profile
app.post("/signup", userController.registerUser);
app.post("/login", userController.login);
app.get("/profile", middlewareToken, userController.getProfile);
app.put("/profile", middlewareToken, userController.updateProfile);
app.delete("/profile", middlewareToken, userController.deleteProfile);

// Booking
app.get("/clinics", bookingController.getAllClinics);
app.get("/doctors", bookingController.getDoctorsByClinicId);
app.get("/availability", bookingController.getAvailableSlots);
app.post("/book", middlewareToken, bookingController.createBooking);
app.get("/my-bookings", middlewareToken, bookingController.getMyBookings);
app.put("/bookings/:clinicId/:bookingDate/:bookingSeq", middlewareToken, bookingController.cancelBooking);
app.put("/bookings/:clinicId/:bookingDate/:bookingSeq/update-time", middlewareToken, bookingController.updateBookingTime);

// Staff for Booking
app.get("/staff/clinic-bookings", middlewareToken, clinicController.getBookingsForStaff);
app.get("/staff/clinic-info", middlewareToken, clinicController.getClinicInfoForStaff);
app.put("/staff/cancel/:clinicId/:bookingDate/:bookingSeq/:userId", middlewareToken, clinicController.cancelBooking);
app.put("/staff/confirm/:clinicId/:bookingDate/:bookingSeq/:userId", middlewareToken, clinicController.confirmBookingByStaff);

// Group Chat
const authenticateToken = require("./middleware/jwtTransfer");
app.post("/groupchat", authenticateToken.authenticateToken, groupController.createGroup);
app.get("/groupchat", groupController.getAllGroups);
app.get("/usergroupchat", authenticateToken.authenticateToken, groupController.getGroupByUser);
app.get("/groupchat/:name", groupController.getGroupByName);
app.put("/groupchat/:id", groupController.updateGroup);
app.delete("/groupchat/:id", groupController.deleteGroup);

// grp chat messages 
app.get("/messages/:groupID" , msgController.getMsgBygID);

// ────── Socket.IO Setup ──────
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinGroup', (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on('sendMessage', async ({ groupId, userId, message }) => {
    const msgTime = new Date();

    io.to(`group_${groupId}`).emit('newMessage', {
      groupId,
      userId,
      message,
      msgTime,
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// ────── Start Server ──────
server.listen(port, async () => {
  try {
    await sql.connect(require("./dbConfig"));
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
  console.log(`Server (Express + Socket.IO) running on port ${port}`);
});

// ────── Graceful Shutdown ──────
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});
