const express = require('express');
const {getUsers, updateCurrentUser, updateUserByID, deleteCurrentUser, deleteUserByID} = require('../controllers/users');
const {protect, authorize} = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, authorize('admin'), getUsers).put(protect, updateCurrentUser).delete(protect, deleteCurrentUser);
router.route('/:id').put(protect, authorize('admin'), updateUserByID).delete(protect, authorize('admin'), deleteUserByID);

module.exports = router;