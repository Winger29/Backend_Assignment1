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

async function getMessageById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid message ID" });
      }
  
      const messageid = await msgModel.getMessageByID(id);
      if (!messageid) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.json(messageid);
    } catch (error) {
      console.error("Controller error:", error);
      res.status(500).json({ error: "Error retrieving message" });
    }
  }

async function createMessage(req, res) {
try {
    const newMessage = await msgModel.createMessage(req.body);
    res.status(201).json(newMessage);
} catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating message"});
}
}

async function updateMessage(req, res) {
try {
    const id = parseInt(req.params.msgID);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid message ID" });
    }

    const updatedMessage = await msgModel.updateMessage(id, req.body);
    if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
    }

    res.json(updatedMessage);
} catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating message" });
}};


async function deleteMessage(req, res) {
try {
    const id = parseInt(req.params.msgID);
    if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
    }

    const deleteMsg = await msgModel.deleteMessage(id);
    if (!deleteMsg) {
    return res.status(404).json({ error: "Message not found" });
    }

    res.json(deleteMsg);
} catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting message" });
}
}
module.exports = {
  getMsgBygID,
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage
};