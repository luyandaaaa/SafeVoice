const express = require('express');
const router = express.Router();
const { uploadEvidence, getEvidence, deleteEvidence } = require('../controllers/evidenceController');
const auth = require('../middleware/auth');

router.use(auth);  // Protect all routes

router.post('/upload', uploadEvidence);
router.get('/:incidentId', getEvidence);
router.delete('/:id', deleteEvidence);

module.exports = router;