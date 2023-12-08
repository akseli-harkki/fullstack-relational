const jwt = require('jsonwebtoken')
const { Blog, User, Session } = require('../models')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id, {
    include: [{
      model: User,
      attributes: ['name']
    }]
  })
  next()
}

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.params.id, {
    include: {
      model: Blog
    }
  })
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.replace('Bearer ', '')
    req.decodedToken = jwt.verify(token, process.env.SECRET)
  } else {
    req.token = null
  }
  next()
}

const userExtractor = async(req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.replace('Bearer ', '')
    decodedToken = jwt.verify(token, process.env.SECRET)
  } else {
    token = null
  }

  const user = await User.findByPk(decodedToken.id)
  const usersSession = await Session.findOne({
    where: {
      userId: user.id
    }
  })
  console.log('token: ' + token)
  /* console.log('usersession: ' + usersSession.token) */
  if (usersSession && token === usersSession.token) {
    req.user = user
  } else {
    return res.status(401).json({ error: 'you do not have permission to do this'})
  }
  next()
}

const errorHandler = (error, req, res, next) => {
  console.log('virheviesti: ' + error.name)

  switch (error.name) {
    case 'SequelizeValidationError':
      return res.status(400).json({ error: Object.values(error.errors).map(val => val.message)[0] })
    case 'SequelizeDatabaseError':
      return res.status(400).json({ error: error.message }) 
    case 'JsonWebTokenError':
      return res.status(400).json({ error: 'token missing or invalid' })
  }

  next(error)
}

module.exports = {
  blogFinder, userFinder, tokenExtractor, userExtractor, errorHandler
}