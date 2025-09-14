const express = require('express');
const {
  createTicket,
  getTickets,
  getTicket,
  addMessage,
  initiateVoiceCall,
  endVoiceCall,
} = require('../controllers/supportController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Ticket routes
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.post('/tickets/:id/messages', addMessage);

// Voice call routes
router.post('/voice-call/initiate', initiateVoiceCall);
router.post('/voice-call/:callId/end', endVoiceCall);

module.exports = router;