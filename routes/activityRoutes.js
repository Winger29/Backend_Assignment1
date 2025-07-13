const express = require('express');
const router = express.Router();
const {
  handleGetAllActivities,
  handleCreateActivity,
  handleUpdateActivity,
  handleDeleteActivity
} = require('../controllers/activityController');

router.get('/activities', handleGetAllActivities);       // View all
router.post('/activities', handleCreateActivity);        // Add new
router.put('/activities/:id', handleUpdateActivity);     // Update by ID
router.delete('/activities/:id', handleDeleteActivity);  // Delete by ID

module.exports = router;

