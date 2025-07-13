const { 
  getAllActivities, 
  createActivity, 
  updateActivity, 
  deleteActivity 
} = require('../models/activityModel');

async function handleGetAllActivities(req, res) {
  try {
    const data = await getAllActivities();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
}

async function handleCreateActivity(req, res) {
  try {
    await createActivity(req.body);
    res.status(201).json({ message: 'Activity created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
}

async function handleUpdateActivity(req, res) {
  try {
    const id = parseInt(req.params.id);
    await updateActivity(id, req.body);
    res.json({ message: 'Activity updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
}

async function handleDeleteActivity(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteActivity(id);
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
}

module.exports = {
  handleGetAllActivities,
  handleCreateActivity,
  handleUpdateActivity,
  handleDeleteActivity
};
