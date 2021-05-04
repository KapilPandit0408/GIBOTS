const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../Auth/userAuth')
const User = require('../models/userModel')

// REGISTRATION API
router.post('/register', async (req, res) => {
  try {
    let { firstname, lastname, email, password, mobile, address } = req.body

    if (!email || !password)
      return res.status(400).json({ msg: 'Not all fields have been entered.' })
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: 'The password needs to be at least 5 characters long.' })

    const existingUser = await User.findOne({ email: email })
    if (existingUser)
      return res
        .status(400)
        .json({ msg: 'An account with this email already exists.' })

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: passwordHash,
      mobile,
      address,
    })
    const savedUser = await newUser.save()
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET)
    res.json({
      token,
      savedUser: {
        id: savedUser._id,
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        mobile: savedUser.mobile,
        address: savedUser.address,
        email: savedUser.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ msg: 'Not all fields have been entered.' })

    const user = await User.findOne({ email: email })
    if (!user)
      return res
        .status(400)
        .json({ msg: 'No account with this email has been registered.' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.json({
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        mobile: user.mobile,
        address: user.address,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// UPDATE API
router.put("/edit/:id", auth, async (req, res) =>{
  try {
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const address = req.body.address
    const newdata = {firstname:firstname, lastname:lastname,email:email,mobile:mobile,address:address}
    console.log(req.body)
    User.findByIdAndUpdate(req.params.id, newdata, (err, updateduser) => {
      if(err) {
          res.json(err)
      }
      else {
          res.json({user:updateduser})
      }
  })
  } catch (error) {
    res.json(error);
  }
})

// PAGINATION API
router.get('/list/:page', auth, (req, res) => {
  var perPage = 10
  var page = req.params.page || 1
  try {
    User.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, founddata) {
      User.count().exec(function (err, count) {
        if (err) return next(err)
        res.status(200).json({
          users: founddata,
          current: page,
          pages: Math.ceil(count / perPage),
        })
      })
    })
  } catch (error) {
    res.json(error)
  }
})

// regex functin for pattern matching
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// SEARCH API FOR PERPAGE
router.get("/find/:page", auth, (req, res) => {
  try {
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get  users from DB
      var perPage = 10
      var page = req.params.page || 1
      const { search } = req.query
      User.find({$or: [
          {firstname: regex},{lastname: regex},{email: regex},{mobile: regex}]
      })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec(function (err, founddata) {
          User.count().exec(function (err, count) {
            if (err) return next(err)
            res.status(200).json({
              users: founddata,
              current: page,
              pages: Math.ceil(count / perPage),
            })
          })
        })
  }
  // If no search then all users display
  else {
      console.log(req.user)
      // Get all users from DB
      User.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(function (err, founddata) {
        User.count().exec(function (err, count) {
          if (err) return next(err)
          res.status(200).json({
            users: founddata,
            current: page,
            pages: Math.ceil(count / perPage),
          })
        })
      });
  }
  } catch (error) {
    res.json(error)
  }
});

module.exports = router
