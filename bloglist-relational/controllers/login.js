const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const { User, Session } = require('../models')

router.post('/', async (req, res) => {
  const body = req.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }

  if (user.banned) {
    return res.status(401).json({
      error: 'account banned, please contact admin'
    })
  }

  await Session.destroy({ where: { userId: user.id }})

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, SECRET)  

  await Session.create({ userId: user.id, token: token })

  res
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router