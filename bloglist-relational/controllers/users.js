const bcrypt = require('bcrypt')
const router = require('express').Router()
const { User, Blog, Session } = require('../models')
const { userFinder, userExtractor } = require('../util/middleware')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  const { username, name, password, admin } = req.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = {
    username: username,
    name: name,
    passwordHash: passwordHash,
    admin: admin
  }

  const savedUser = await User.create(user)

  res.status(201).json(savedUser)
})

router.get('/:id', userFinder, async (req, res) => {
  let where = {}
  if (req.query.search) {
    where = {
      read: req.query.search
    }
  }
  const user = await User.findByPk(req.params.id, {
    attributes: ['username', 'name'],
    include: [{
      model: Blog,
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] }
    },
    {
      model: Blog,
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      as: 'readings',
      through: {
        attributes: ['read', 'id'],
        where
      }
    }]
  })
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.put('/', userExtractor, async (req, res) => {
  req.user.username = req.body.username
  await req.user.save()
  res.json(req.user)  
})

const isAdmin = async (req, res, next) => {
  console.log(req.user.admin)
  if (!req.user.admin) {
    return res.status(401).json({ error: 'operation not permitted' })
  }
  next()
}

router.put('/:username/admin', userExtractor, isAdmin, async (req, res) => {
  const user = await User.findOne({ 
    where: {
      username: req.params.username
    }
  })

  if (user) {
    user.banned = req.body.banned
    await user.save()
    await Session.destroy({ where: { userId: user.id }})
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router