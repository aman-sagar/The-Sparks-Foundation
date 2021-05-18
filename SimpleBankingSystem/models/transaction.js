const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new Schema({
    transferamt: Number,

    sender: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    reciever: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
}, { timestamps: true });

transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);