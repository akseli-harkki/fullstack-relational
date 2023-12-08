const router = require('express').Router()
const { Op } = require("sequelize")
const { Blog, User, ReadingList } = require('../models')
const { blogFinder, userExtractor } = require('../util/middleware')

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: req.query.search ? `%${req.query.search}%` : ''
          }
        },
        {
          author: {
            [Op.iLike]: req.query.search ? `%${req.query.search}%` : ''
          }
        }
      ]      
    }
  }

  const blogs = await Blog.findAll({
    order: [['likes', 'DESC']],
    attributes: { exclude: ['userId'] },
    include: [{
      model: User,
      attributes: ['name']
    }],
    where
  })

  res.json(blogs)
})

router.post('/', userExtractor, async (req, res) => {
  const blog = await Blog.create({ ...req.body, userId: req.user.id })
  return res.json(blog)
})

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', blogFinder, userExtractor, async (req, res) => {
  const blogToBeDeleted = await req.blog

  if (blogToBeDeleted && blogToBeDeleted.userId !== req.user.id) {
    return res.status(401).json({ error: 'cannot delete another user`s blog' }) 
  }

  await ReadingList.destroy({ where: { blogId: blogToBeDeleted.id }})

  await blogToBeDeleted.destroy()
  res.json(204).end()
})

router.put('/:id', blogFinder, async (req, res) => {
  
  if (req.blog) {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

module.exports = router