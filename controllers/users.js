const User = require('../models/User');
const bcrypt = require('bcryptjs');

//@desc     Get all users
//@route    GET /api/users
//@access   Private
exports.getUsers = async (req, res, next) => {
    try {
        const user = await User.find();
        res.status(200).json({success: true, count: user.length, data: user});
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: 'Cannot find Users'});
    }
};

//@desc     Update current login user
//@route    PUT /api/users
//@access   Private
exports.updateCurrentUser = async (req, res, next) => {
    try {
        // Cannot update user's role
        if (req.body.role && req.user.role !== 'admin') {
            return res.status(405).json({success: false, message: `Cannot update user's role`});
        }

        // Cannot update user's createdAt
        if (req.body.createdAt) {
            return res.status(405).json({success: false, message: `Cannot update user's created date`});
        }
        
        // If user want to change password, encrypt password before update
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // Update user
        const user = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: user});
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: 'Cannot update user'});
    }
};

//@desc     Update user by id
//@route    PUT /api/users/:id
//@access   Private
exports.updateUserByID = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({success: false, message: `No user with id ${req.params.id}`});
        }

        // Cannot update user's createdAt
        if (req.body.createdAt) {
            return res.status(405).json({success: false, message: `Cannot update user's created date`});
        }
        
        // If user want to change password, encrypt password before update
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // Update user
        user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: user});
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: 'Cannot update user'});
    }
};

//@desc     Delete current user
//@route    DELETE /api/users
//@access   Private
exports.deleteCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        await user.deleteOne();

        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10*1000),
            httpOnly: true
        });

        res.status(200).json({success: true, message: 'User has been deleted'});
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: 'Cannot delete user'});
    }
};


//@desc     Delete user by ID
//@route    DELETE /api/users/:id
//@access   Private
exports.deleteUserByID = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({success: false, message: `No user with id ${req.params.id}`})
        }

        await user.deleteOne();

        // If delete current id, remove cookie
        if (req.user.id == req.params.id) {
            res.cookie('token', 'none', {
                expires: new Date(Date.now() + 10*1000),
                httpOnly: true
            });
        }

        res.status(200).json({success: true, message: 'User has been deleted'});
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: 'Cannot delete user'});
    }
};