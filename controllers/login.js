const loginRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  
  if (!(user && await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const token = jwt.sign({ username: user.username, id: user._id }, config.JWT_SECRET, { expiresIn: 60*60 })

  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter