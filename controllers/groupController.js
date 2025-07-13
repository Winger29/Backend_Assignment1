const groupModel = require("../models/groupModel");

// get all books (api test) 
async function getAllGroups(req,res) {
    try {
        const books = await groupModel.getAllGroups();
        res.json(books);
      } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving books" });
      }
}

async function createGroup(req,res){
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const newGroup = await groupModel.createGroup(req.body,userId);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating group"});
  }
}

async function getGroupByUser(req,res) {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const usergroupchat = await groupModel.getGroupByUserID(userId);
    if (!usergroupchat) {
      return res.status(404).json({ error: "There are no groups associating with user" });
    }

    res.json(usergroupchat);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving user" });
  }
}

async function updateGroup(req, res) {
  try{
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
          return res.status(400).json({ error: "Invalid Group" });
      }
      const updatedGroup = await groupModel.updateGroupByID(id, req.body);
      if (!updatedGroup) {
          return res.status(404).json({ error: "Group not found" });
      }
      res.json(updatedGroup);
  } catch (error){
      console.error("controller error", error)
      res.status(500).json({ error: "Error updating Group" });
  }
}

async function deleteGroup(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const deletedGroup = await bookModel.deleteGroup(id);
    if (!deletedGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(deletedGroup);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting Group" });
  }
}


module.exports = {
    getAllGroups,
    updateGroup,
    deleteGroup,
    getGroupByUser,
    createGroup
}