const Incident = require('../models/Incident');

// @route   POST api/reports
// @desc    Create a new incident report
// @access  Private
exports.createIncident = async (req, res) => {
  try {
    const { type, description, location, evidenceFiles } = req.body;
    
    const incident = new Incident({
      userId: req.user.id,
      type,
      description,
      location,
      evidenceFiles
    });

    const savedIncident = await incident.save();
    res.json(savedIncident);
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
    const incidents = await Incident.find({ userId: req.user.id }).sort({ createdAt: -1 });
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
    
    // Build incident object
    const incidentFields = {};
    if (type) incidentFields.type = type;
    if (description) incidentFields.description = description;
    if (location) incidentFields.location = location;
    if (status) incidentFields.status = status;
    incidentFields.updatedAt = Date.now();

    let incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ msg: 'Incident not found' });
    }

    // Make sure user owns incident
    if (incident.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: incidentFields },
      { new: true }
    );

    res.json(incident);
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

    await incident.deleteOne();
    res.json({ msg: 'Incident removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};