const express = require('express');
const router = express.Router();
const {
  GetAllActivities,
  CreateActivity,
  UpdateActivity,
  DeleteActivity
} = require('../../controllers/activityController');

router.get('/activities', GetAllActivities);       // View all
router.post('/activities', CreateActivity);        // Add new
router.put('/activities/:id', UpdateActivity);     // Update by ID
router.delete('/activities/:id', DeleteActivity);  // Delete by ID

module.exports = router;

