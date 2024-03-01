const express = require('express');
const {getCoworkingSpace, getCoworkingSpaces, createCoworkingSpace, updateCoworkingSpace, deleteCoworkingSpace} = require('../controllers/coworkingspaces');

//Include other resource routers
const reservations = require('./reservations');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:coworkingspaceId/reservations', reservations);

router.route('/').get(getCoworkingSpaces).post(protect, authorize('admin'), createCoworkingSpace);
router.route('/:id').get(getCoworkingSpace).put(protect, authorize('admin'), updateCoworkingSpace).delete(protect, authorize('admin'), deleteCoworkingSpace);

module.exports = router;