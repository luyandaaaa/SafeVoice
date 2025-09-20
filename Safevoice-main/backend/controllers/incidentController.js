const Incident = require('../models/Incident');

// @route   POST api/reports
// @desc    Create a new incident report
// @access  Private
exports.createIncident = async (req, res) => {
  try {
    const {
      type,
      urgency,
      date,
      time,
      location,
      description,
      perpetrator,
      witnesses,
      notes,
      anonymous,
      consent,
      status
    } = req.body;
    
    const result = await Incident.create({
      userId: req.user.id,
      type,
      urgency,
      date,
      time,
      location,
      description,
      perpetrator,
      witnesses,
      notes,
      anonymous,
      consent,
      status: status || 'submitted'
    });

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/reports
// @desc    Get all incidents for a user
// @access  Private
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.findByUserId(req.user.id);
    res.json(incidents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/reports/:id
// @desc    Update an incident
// @access  Private
exports.updateIncident = async (req, res) => {
  try {
    const { type, description, location, status } = req.body;
    
    // Get the incident first
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ msg: 'Incident not found' });
    }

    // Make sure user owns incident
    if (incident.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update the incident
    const updatedIncident = await Incident.updateById(req.params.id, {
      ...req.body,
      updatedAt: new Date()
    });

    res.json(updatedIncident);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/reports/:id
// @desc    Delete an incident
// @access  Private
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ msg: 'Incident not found' });
    }

    // Make sure user owns incident
    if (incident.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Incident.deleteById(req.params.id);
    res.json({ msg: 'Incident removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};