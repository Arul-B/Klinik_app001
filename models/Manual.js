const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const manualSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    timestamp: true
  },
  nrp: {
    type: String,
    required: true
  },
  dept: {
    type: String,
    required: true
  },
  no_hp: {
    type: String,
    required: false
  },
  jk: {
    type: String,
    required: false
  },
  site: {
    type: String,
    required: false
  },
  created_at: {
    type: Date, 
  },
  itemId: [{
    type: ObjectId,
    ref: 'Item'
  }]
})

// Sets the created_at parameter equal to the current time
manualSchema.pre('save', function(next){
  now = new Date();
  if(!this.created_at) {
      this.created_at = now
  }
  next();
});

module.exports = mongoose.model('Manual', manualSchema)