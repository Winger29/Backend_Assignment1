const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function registerUser(req, res) {
  try {
    const { role,email,password } = req.body; 

    if (!role || !["senior", "staff","organiser"].includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid or missing role. Must be 'senior' or 'staff' or 'organiser'." });
    }

    const emailExists = await userModel.checkEmailExists(role.toLowerCase(), email);
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    let userId;
    if (role === "senior") {
      userId = await userModel.createSenior(req.body);
    } else if (role === "staff") {
      const result = await userModel.registerStaff(req.body);
      userId = result.staffId;
    } else if (role === "organiser") {
      userId = await userModel.createOrganiser(req.body);
    }

    const token = jwt.sign({ id: userId, role }, process.env.SECRET_KEY, { expiresIn: "1h" });

    return res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      userId,
      role,
      token,
      redirect: `/${role}.html`
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
}


async function login(req, res) {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ error: "Missing role, email, or password" });
  }

  try {
    const user = await userModel.loginUser(role.toLowerCase(), email);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!user || !passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

  const token = jwt.sign(
  { id: user.userId, role: role.toLowerCase() },
  process.env.SECRET_KEY,
  { expiresIn: "1h" }
);

    return res.status(200).json({
      message: `Welcome, ${user.fullName}`,
      userId: user.userId,
      role,
      token,
      redirect: `/${role}.html`
    });

  } catch (err) {
    console.error("Login controller error:", err);
    return res.status(500).json({ error: "Login failed due to server error" });
  }
}

async function getProfile(req, res) {
  const { role, id } = req.user;

  if (!role || !id) {
    return res.status(400).json({ error: "Missing role or ID in request" });
  }

  try {
    const profile = await userModel.getUserProfile(role, id);

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// === UPDATE SENIOR ===
async function updateProfile(req, res) {
  try {
    const { role, id } = req.user;
    const updatedData = req.body;

    if (updatedData.password && updatedData.password !== "********") {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    } else {
      delete updatedData.password;
    }

    let result;
    if (role === "senior") {
      result = await userModel.updateSenior(id, updatedData);
    } else if (role === "staff") {
      result = await userModel.updateStaff(id, updatedData);
    }  else if (role === "organiser") {
      result = await userModel.updateOrganiser(id, updatedData);
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
    } else if (role === "organiser") {
      result = await userModel.deleteOrganiser(id);
    } else {
      return res.status(400).json({ error: "Invalid role for deletion" });
    }

    if (result.rowsAffected?.[0] === 0) {
      return res.status(404).json({ error: "Profile not found or already deleted" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
}

module.exports = {
    registerUser,
    login,
    updateProfile,
    deleteProfile,
    getProfile,
};


