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
const eventController=require("./controllers/eventsController");
const validateUser = require("./middlewares/validateUser");
const {
  validateBooking,
  validateTimeUpdate,
  validateBookingParams
} = require("./middlewares/validateBooking");

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
app.post("/signup",validateUser.validateSignup, userController.registerUser);
app.post("/login",validateUser.validateLogin, userController.login);

app.get("/profile", middlewareToken,userController.getProfile);
app.put("/profile", middlewareToken, userController.updateProfile);
app.delete("/profile", middlewareToken, userController.deleteProfile);

// Booking
app.get("/clinics", bookingController.getAllClinics);
app.get("/doctors", bookingController.getDoctorsByClinicId);
app.get("/availability", bookingController.getAvailableSlots);
app.post("/book", middlewareToken, validateBooking,bookingController.createBooking);
app.get("/my-bookings", middlewareToken, bookingController.getMyBookings);
app.put("/bookings/:clinicId/:bookingDate/:bookingSeq", middlewareToken, bookingController.cancelBooking);
app.put("/bookings/:clinicId/:bookingDate/:bookingSeq/update-time", middlewareToken, validateBookingParams,validateTimeUpdate,bookingController.updateBookingTime);

//Staff management for Booking
app.get("/staff/clinic-bookings", middlewareToken, clinicController.getBookingsForStaff);
app.get("/staff/clinic-info", middlewareToken, clinicController.getClinicInfoForStaff);
app.put("/staff/cancel/:clinicId/:bookingDate/:bookingSeq/:userId", middlewareToken, clinicController.cancelBooking);
app.put("/staff/confirm/:clinicId/:bookingDate/:bookingSeq/:userId", middlewareToken, clinicController.confirmBookingByStaff);
// Group Chat
app.post("/groupchat", middlewareToken, groupController.createGroup);
app.get("/groupchat",groupController.getAllGroups);
app.get("/usergroupchat", middlewareToken, groupController.getGroupByUser);
app.get("/groupchat/:name", groupController.getGroupByName);
app.put("/groupchat/:id", groupController.updateGroup);
app.delete("/groupchat/:id", groupController.deleteGroup);

// grp chat messages 
app.post("/messages", msgController.createMessage);
app.post("/member", groupController.createMember);
app.get("/messages/:groupID" , msgController.getMsgBygID);
app.delete("/messages/:msgID", msgController.deleteMessage); 
app.put("/message/:msgID", msgController.updateMessage);

// --- SOCKET.IO SETUP ---
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinGroup', (groupId) => {
    const room = `group_${groupId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('sendMessage', ({ room, message }) => {
    io.to(room).emit('receiveMessage', message);
  });

  socket.on('sendMessageToGroup', ({ groupId, userId, message }) => {
    const msgTime = new Date();
    const room = `group_${groupId}`;
    io.to(room).emit('newMessage', {
      groupId,
      userId,
      message,
      msgTime,
    });
  });

  socket.on('chatMessage', (data) => {
    const room = `group_${data.groupid}`;
    // Broadcast the message to others in the group room
    socket.to(room).emit('newMessage', {
      groupId: data.groupid,
      userId: data.senderid,
      sender: data.sender,
      message: data.content,
      msgTime: data.timestamp
    });
  });

  socket.on("deleteMessage", ({ messageId, groupID }) => {
    console.log(`deleteMessage received. msgID: ${messageId}, groupID: ${groupID}`);
    const room = `group_${groupID}`;
    console.log(`Emitting to room: ${room}`);
    io.to(room).emit("messageDeleted", { messageId });
  });
  
  
  

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// events routes
app.get("/events", eventController.getAllEvents);
app.get("/events/:id", eventController.getEventById);
app.post("/events", eventController.createEvent);
app.put("/events/:id", middlewareToken,  eventController.updateEvent);
app.delete("/events/:id", middlewareToken, eventController.deleteEvent);
app.post("/events/signup", middlewareToken, eventController.signupForEvent);
app.get("/events/:eventId/signups", eventController.getEventSignups);
app.get("/my-events", middlewareToken, eventController.getMyEvents);
app.delete("/events/:eventId/cancel-signup", middlewareToken, eventController.cancelSignup);


const externalApiController = require("./controllers/externalApiController");
const { validateSignup } = require("./middlewares/validateUser");
app.get("/api/external-events",middlewareToken, externalApiController.getFormattedEvents);


// --- START SERVER ---
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

// Graceful shutdown on Ctrl+C
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});
