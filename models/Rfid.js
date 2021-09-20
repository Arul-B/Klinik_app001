const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const rfidSchema = new mongoose.Schema({
  rfid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  nrp: {
    type: String,
    required: false
  },
  dept: {
    type: String,
    required: true
  },
  no_hp: {
    type: String,
    required: false
  },
  itemId: [{
    type: ObjectId,
    ref: 'Item'
  }]
})

module.exports = mongoose.model('Rfid', rfidSchema)