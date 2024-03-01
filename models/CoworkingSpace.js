const mongoose = require('mongoose');

const CoworkingSpaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],
        maxlength: [5, 'Postal Code can not be more than 5 digits']
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number']
    },
    region: {
        type: String,
        required: [true, 'Please add a region']
    },
    opentime:{
        type: String,
        required: [true, 'Please add a opening time']
    },
    closetime:{
        type: String,
        required: [true, 'Please add a closing time']
    }
},
{
    //id: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete reservations when a coworkingspace is deleted
CoworkingSpaceSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Reservations being removed from coworkingspace ${this._id}`);
    await this.model('Reservation').deleteMany({coworkingspace: this._id});
    next();
});

//Reverse populate with virtuals
CoworkingSpaceSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'coworkingspace',
    justOne: false
});

module.exports = mongoose.model('coworkingspace', CoworkingSpaceSchema);