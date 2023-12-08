const router = require('express').Router()
const { ReadingList } = require('../models')
const { userExtractor } = require('../util/middleware')

router.post('/', userExtractor, async (req, res) => {
  const readingList = await ReadingList.create({ ...req.body, userId: req.user.id })

  res.json(readingList)
})

router.put('/:id', userExtractor, async (req, res) => {
  const readingList = await ReadingList.findByPk(req.params.id)
  if (!readingList) {
    return res.status(404).json({ error: 'the reading list does not exist' })
  }
  if (readingList.userId !== req.user.id) {
    return res.status(401).json({ error: 'cannot update another user`s reading list' })
  }
  readingList.read = req.body.read
  await readingList.save()
  res.json(readingList)  
})

module.exports = router