const { 
  getAllActivities, 
  createActivity, 
  updateActivity, 
  deleteActivity 
} = require('../models/activityModel');

async function GetAllActivities(req, res) {
  try {
    const data = await getAllActivities();
    res.json(data);
  } catch (err) {
    console.error('Error fetching activities:', err);  // Add this line to log error
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
}


async function CreateActivity(req, res) {
  try {
    await createActivity(req.body);
    res.status(201).json({ message: 'Activity created' });
  } catch (err) {
    console.error('Error in CreateActivity:', err);
    res.status(500).json({ error: 'Failed to create activity' });
  }
}

async function UpdateActivity(req, res) {
  try {
    const id = parseInt(req.params.id);
    await updateActivity(id, req.body);
    res.json({ message: 'Activity updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
}

async function DeleteActivity(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteActivity(id);
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
}

module.exports = {
  GetAllActivities,
  CreateActivity,
  UpdateActivity,
  DeleteActivity
};
