const router = require('express').Router();
const Call = require('../models/Call');

// POST /api/calls - store call history
router.post('/', async (req, res) => {
  try {
    console.log(req);
    console.log(req.body);
    console.log(req.files);
    // const call = new Call(req.body);
    // const savedCall = await call.save();
    // res.status(201).json(savedCall);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Optional: GET all call logs
router.get('/', async (req, res) => {
  try {
    const calls = await Call.find().sort({ timestamp: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
