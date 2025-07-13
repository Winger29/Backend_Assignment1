const express = require("express");
const router = express.Router();
const controller = require("../controllers/remindersController");

router.get("/", controller.getReminders);
router.post("/", controller.createReminder);
router.put("/:id", controller.updateReminder);
router.delete("/:id", controller.deleteReminder);

module.exports = router;