const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const custSchema = new Schema({
    fName: String,
    lName: String,
    email: String,
    balance: Number,
    dob: Date,
    mobNo: Number,
    address: String,
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }]
});

module.exports = mongoose.model('Customer', custSchema);