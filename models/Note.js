const mongoose = require('mongoose')
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  societyName: {
    type: String,
    required: true
  },
  area: {
    type: Number,
    required :true
},
  totalPrice: {
    type: Number,
    required: true,
  },
  downPayment: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  paidInstallments: {
    type: Number
  },
  balloted: {
    type: Boolean,
    required: true
  },
  plotNumber: {
    type: String,
  },

  discription: {
    type: String,
    required: true
  },
  yearOfPurchase: {
    type: Number,
    required: true
  },
  
  phoneNumber: {
    type: Number
  },
  email : String,

  date: {
    type: Date,
    default: Date.now
  },

});

module.exports = mongoose.model('notes', NotesSchema)