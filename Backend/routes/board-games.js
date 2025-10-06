const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/boardGame.controller');

// Create row
router.post('/', ctrl.create);

// Get item list (allows multiple filters)
router.get('/', ctrl.list);

// Get specific item by ID
router.get('/:id(\\d+)', ctrl.read);

// Import CSV
router.get('/export.csv', ctrl.exportCsv);

module.exports = router;
