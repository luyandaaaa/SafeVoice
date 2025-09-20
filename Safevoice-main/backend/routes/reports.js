const express = require('express');
const router = express.Router();
const { createIncident, getIncidents, updateIncident, deleteIncident } = require('../controllers/incidentController');
const auth = require('../middleware/auth');

router.use(auth);  // Protect all routes

router.post('/', createIncident);
router.get('/', getIncidents);
router.put('/:id', updateIncident);
router.delete('/:id', deleteIncident);

module.exports = router;