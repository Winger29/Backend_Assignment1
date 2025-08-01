const groupModel = require("../models/groupModel");

// get all books (api test) 
async function getAllGroups(req,res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
        const groups = await groupModel.getAllGroups(userId);
        res.json(groups);
      } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving groups" });
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

async function createMember(req,res){
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const newGroup = await groupModel.createGroup(req.body,userId);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating member"});
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

async function getGroupByName(req,res){
  try {
    const groupName = req.params.name;
    if (!groupName) {
      return res.status(400).json({ error: "Invalid group name" });
    }

    const group = await groupModel.getGroupByName(groupName);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving group" });
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

    const deletedGroup = await groupModel.deleteGroup(id);
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
    getGroupByName,
    createGroup,
    createMember
}