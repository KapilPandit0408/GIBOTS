const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstname:String,
  lastname:String,
  email: { type: String, unique: true,},
  password: { type: String, required: true, minlength: 5 },
  mobile:String,
  address:String
})

module.exports = User = mongoose.model('user', userSchema)
