const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/geocode', mapController.geocode.bind(mapController));
router.get('/search', mapController.search.bind(mapController));
router.post('/location', mapController.saveLocation.bind(mapController));

module.exports = router;

