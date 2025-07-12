const sql = require("mssql")
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
async function registerUser(req, res) {
  try {
    const { role,email } = req.body;

    if (!role || !["senior", "staff"].includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid or missing role. Must be 'senior' or 'staff'." });
    }

    const emailExists = await userModel.checkEmailExists(role.toLowerCase(), email);
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    if (role.toLowerCase() === "senior") {
      const newSenior = await userModel.createSenior(req.body);
      const token = jwt.sign(
        { id: newSenior, role: "senior" },
        SECRET_KEY,
        { expiresIn: "1h" }
      );  
      return res.status(201).json({
        message: "Senior account created successfully",
        userId: newSenior,
        role: "senior",
        token,
        redirect: "/senior.html"
      });

    } else if (role.toLowerCase() === "staff") {
      const newStaff = await userModel.registerStaff(req.body);
      const token = jwt.sign(
        { id: newStaff, role: "staff" },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "Staff account created successfully",
        userId: newStaff,
        role: "staff",
        token,
        redirect: "/staff.html"
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
}

async function updateProfile(req, res) {
  try {
    const { role, id } = req.user;
    const updatedData = req.body;

    let result;
    if (role === "senior") {
      result = await userModel.updateSenior(id, updatedData);
    } else if (role === "staff") {
      result = await userModel.updateStaff(id, updatedData);
    } else {
      return res.status(400).json({ error: "Invalid role for update" });
    }

    res.status(200).json({ message: "Profile updated successfully", result });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
}

async function deleteProfile(req, res) {
  try {
    const { role, id } = req.user;

    let result;
    if (role === "senior") {
      result = await userModel.deleteSenior(id);
    } else if (role === "staff") {
      result = await userModel.deleteStaff(id);
    } else {
      return res.status(400).json({ error: "Invalid role for deletion" });
    }

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Profile not found or already deleted" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
}

async function login(req, res) {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ error: "Missing role, email, or password" });
  }
  
  try {
    const user = await userModel.loginUser(role, email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
    { id: user.userId, role: role.toLowerCase() },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

    return res.status(200).json({
      message: `Welcome, ${user.fullName}`,
      userId: user.userId,
      role: role.toLowerCase(),
      token,
      redirect: role.toLowerCase() === "senior" ? "/senior.html" : "/staff.html"
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}

async function getProfile(req, res) {
  const { role, id } = req.user;

  if (!role || !id) {
    return res.status(400).json({ error: "Missing role or ID in request" });
  }

  try {
    let profile;

    if (role === "senior") {
      profile = await userModel.getSeniorProfile(id);
    } else if (role === "staff") {
      profile = await userModel.getStaffProfile(id);
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = {
    registerUser,
    updateProfile,
    deleteProfile,
    login,
    getProfile,
};


