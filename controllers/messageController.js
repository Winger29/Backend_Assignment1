const msgModel = require("../models/messageModel");

async function getMsgBygID(req,res) {
  try {
    const groupID = req.params.groupID;
    if (!groupID) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const msgResult = await msgModel.getMessageBygID(groupID);
    if (!msgResult) {
      return res.status(404).json({ error: "There are no messages associated to the group" });
    }

    res.json(msgResult);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving messages" });
  }
}

module.exports = {
  getMsgBygID
};