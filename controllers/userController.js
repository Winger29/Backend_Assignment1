const sql = require("mssql")
const userModel = require("../models/userModel");

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
      return res.status(201).json({
        message: "Senior account created successfully",
        data: newSenior,
        redirect: "/senior.html"
      });

    } else if (role.toLowerCase() === "staff") {
      const newStaff = await userModel.registerStaff(req.body);
      return res.status(201).json({
        message: "Staff account created successfully",
        data: newStaff,
        redirect: "/staffMain.html"
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
}

// === UPDATE SENIOR ===
async function updateSenior(req, res) {
  try {
    const seniorId = req.params.id;
    const updatedSenior = req.body;
    const result = await userModel.updateSenior(seniorId, updatedSenior);
    res.status(200).json({ message: "Senior updated successfully", result });
  } catch (error) {
    console.error("Controller error (updateSenior):", error);
    res.status(500).json({ error: "Error updating senior" });
  }
}

// === UPDATE ORGANISER ===
async function updateStaff(req, res) {
  try {
    const staffId = req.params.id;
    const updatedStaff = req.body;
    const result = await userModel.updateStaff(staffId, updatedStaff);
    res.status(200).json({ message: "Staff updated successfully", result });
  } catch (error) {
    console.error("Controller error (updateStaff):", error);
    res.status(500).json({ error: "Error updating staff" });
  }
}

// === DELETE SENIOR ===
async function deleteSenior(req, res) {
  try {
    const seniorId = req.params.id;
    const result = await userModel.deleteSenior(seniorId);
    res.status(200).json({ message: "Senior deleted successfully", result });
  } catch (error) {
    console.error("Controller error (deleteSenior):", error);
    res.status(500).json({ error: "Error deleting senior" });
  }
}

// === DELETE ORGANISER ===
async function deleteStaff(req, res) {
  try {
    const staffId = req.params.id;
    const result = await userModel.deleteStaff(staffId);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Staff not found or already deleted" });
    }
    res.status(200).json({ message: "Staff deleted successfully", result });
  } catch (error) {
    console.error("Controller error (deleteStaff):", error);
    res.status(500).json({ error: "Error deleting staff" });
  }
}

async function login(req, res) {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ error: "Missing role, email, or password" });
  }

  try {
    const user = await userModel.loginUser(role.toLowerCase(), email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.status(200).json({
      message: `Welcome, ${user.fullName}`,
      userId: user.userId,
      role: role.toLowerCase(),
      redirect: role.toLowerCase() === "senior" ? "/senior.html" : "/staffMain.html"
    });

  } catch (err) {
    console.error("Login controller error:", err);
    return res.status(500).json({ error: "Login failed due to server error" });
  }
}

async function getProfile(req, res) {
  const { role, id } = req.query;

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
    updateSenior,
    updateStaff,
    deleteSenior,
    deleteStaff,
    login,
    getProfile,
};


