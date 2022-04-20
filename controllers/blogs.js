const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, _id: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  if (!request.body.title && !request.body.url) {
    return response.status(400).json({ error: 'missing title and url' })
  }

  const user = request.user

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id
  })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const populatedSavedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1, _id: 1 })
  response.status(201).json(populatedSavedBlog)
})

blogRouter.delete('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)
  if (blog && blog.user.toString() === request.user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  }

  response.status(403).json({ error: 'Operation not allowed for current user' })
})

blogRouter.put('/:id', async (request, response) => {
  if (!request.body.title && !request.body.url) {
    return response.status(400).json({ error: 'missing title and url' })
  }

  const existingBlog = await Blog.findById(request.params.id)
  if (existingBlog && existingBlog.user.toString() === request.user._id.toString()) {
    const blog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes || 0
    }
  
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    return response.json(updatedBlog)
  }

  response.status(403).json({ error: 'Operation not allowed for current user' })
})



module.exports = blogRouter