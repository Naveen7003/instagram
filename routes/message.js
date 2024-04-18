const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [ true, 'msg is required for creating an message document' ]
    },
    sender: {
        type: String,
        required: true
      },
    receiver: {
        type: String,
        required: true
      },
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('message', messageSchema)