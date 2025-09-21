const express = require('express');
const router = express.Router();
const { createIncident, getIncidents, updateIncident, deleteIncident } = require('../controllers/incidentController');
const auth = require('../middleware/auth');

router.use(auth);  // Protect all routes

// Get report count for user
router.get('/count', async (req, res) => {
  try {
    const count = await Incident.countDocuments({ user: req.user.id, status: { $ne: 'draft' } });
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', createIncident);
router.get('/', getIncidents);
router.put('/:id', updateIncident);
router.delete('/:id', deleteIncident);

module.exports = router;