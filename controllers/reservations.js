const Reservation = require('../models/Reservation');
const CoworkingSpace = require('../models/CoworkingSpace');

//@desc     Get all reservations
//@route    GET /api/reservations
//@access   Public
exports.getReservations = async (req, res, next) => {
    let query;

    // General users can see only their reservations
    if (req.user.role !== 'admin') {
        query = Reservation.find({user: req.user.id}).populate({
            path: 'coworkingspace',
            select: 'name address tel opentime closetime'
        });
    } else {
        // If you are admin, you can see all
        if (req.params.coworkingspaceId) {
            query = Reservation.find({coworkingspace: req.params.coworkingspaceId}).populate({
                path: 'coworkingspace',
                select: 'name address tel opentime closetime'
            });
        } else {
            query = Reservation.find().populate({
                path: 'coworkingspace',
                select: 'name address tel opentime closetime'
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot find Reservation"});
    }
};

//@desc     Get single reservation
//@route    GET /api/reservations/:id
//@access   Public
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'coworkingspace',
            select: 'name address tel opentime closetime'
        });

        if (!reservation) {
            return res.status(404).json({success: false, message: `No Reservation with the id of ${req.params.id}`});
        }

        res.status(200).json({success: true, data: reservation});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot find Reservation'});
    }
};

//@desc     Add reservation
//@route    POST /api/coworkingspaces/:coworkingspaceId/reservations
//@access   Private
exports.addReservation = async (req, res, next) => {
    try {
        req.body.coworkingspace = req.params.coworkingspaceId;

        const coworkingspace = await CoworkingSpace.findById(req.params.coworkingspaceId);
        
        if (!coworkingspace) {
            return res.status(404).json({success: false, message: `No co-working space with the id of ${req.params.coworkingspaceId}`});
        }

        // Add user Id to req.body
        req.body.user = req.user.id;

        // Check for existed reservation
        const existedReservations = await Reservation.find({user: req.user.id});

        // If the user is not an admin, they can only create 3 reservations
        if (existedReservations.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 reservations`});
        }

        // Check validation of reservation's time
        let reserveStartTime = new Date(req.body.reserveStartTime);
        let reserveEndTime = new Date(req.body.reserveEndTime);
        let reserveStartDate = reserveStartTime.toISOString().slice(0, 10);
        let reserveEndDate = reserveEndTime.toISOString().slice(0, 10);
        let coworkingOpenTime = new Date(reserveStartDate + 'T' + coworkingspace.opentime + ':00.000Z');
        let coworkingCloseTime = new Date(reserveEndDate + 'T' + coworkingspace.closetime + ':00.000Z');

            // Check if it's the same date
            if (reserveStartDate !== reserveEndDate) {
                return res.status(405).json({success: false, message: 'The reservation start time and end time must be in the same date.'});
            }
        
            // Check if end time occurs after start time
            if (reserveEndTime.getTime() <= reserveStartTime.getTime()) {
                return res.status(405).json({success: false, message: 'The reservation end time must occurs after start time.'});
            }

            // Check if reservation time in co-working space's openning hours
            if (reserveStartTime.getTime() < coworkingOpenTime.getTime() || reserveEndTime.getTime() > coworkingCloseTime.getTime()) {
                return res.status(405).json({success: false, message: `The reservation time must be in co-working space's openning hours`});
            }

            // Check if reservation is not more than 2 hours
            if (reserveEndTime.getTime() - reserveStartTime.getTime() > 2 * 60 * 60 * 1000) {
                return res.status(405).json({success: false, message: `The reservation must not more than 2 hours`});
            }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({success: true, data: reservation});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot create Reservation'});
    }
};

//@desc     Update reservation
//@route    PUT /api/reservations/:id
//@access   Private
exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation intment with the id of ${req.params.id}`});
        }

        // Make sure user is the reservation owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`});
        }

        // Check validation of reservation's time
        const coworkingspace = await CoworkingSpace.findById(reservation.coworkingspace);

        let reserveStartTime = new Date(req.body.reserveStartTime || reservation.reserveStartTime);
        let reserveEndTime = new Date(req.body.reserveEndTime || reservation.reserveEndTime);
        let reserveStartDate = reserveStartTime.toISOString().slice(0, 10);
        let reserveEndDate = reserveEndTime.toISOString().slice(0, 10);
        let coworkingOpenTime = new Date(reserveStartDate + 'T' + coworkingspace.opentime + ':00.000Z');
        let coworkingCloseTime = new Date(reserveEndDate + 'T' + coworkingspace.closetime + ':00.000Z');

            // Check if it's the same date
            if (reserveStartDate !== reserveEndDate) {
                return res.status(405).json({success: false, message: 'The reservation start time and end time must be in the same date.'});
            }
        
            // Check if end time occurs after start time
            if (reserveEndTime.getTime() <= reserveStartTime.getTime()) {
                return res.status(405).json({success: false, message: 'The reservation end time must occurs after start time.'});
            }

            // Check if reservation time in co-working space's openning hours
            if (reserveStartTime.getTime() < coworkingOpenTime.getTime() || reserveEndTime.getTime() > coworkingCloseTime.getTime()) {
                return res.status(405).json({success: false, message: `The reservation time must be in co-working space's openning hours`});
            }

            // Check if reservation is not more than 2 hours
            if (reserveEndTime.getTime() - reserveStartTime.getTime() > 2 * 60 * 60 * 1000) {
                return res.status(405).json({success: false, message: `The reservation must not more than 2 hours`});
            }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: reservation});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot update Reservation'});
    }
};

//@desc     Delete reservation
//@route    DELETE /api/reservations/:id
//@access   Private
exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        // Make sure user is the reservation owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this reservation`})
        }

        await reservation.deleteOne();

        res.status(200).json({success: true, data: {}});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot delete Reservation'});
    }
};