const app = require ('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcryptjs')


const api = supertest(app)
const USER_NAME = 'test'
const USER_PASSWORD = 'sekret'
let USER_AUTH_TOKEN = null // must be set during test suite startup

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash(USER_PASSWORD, 10)
  const user = new User({ username: USER_NAME, passwordHash })
  await user.save()

  const blogs = await Blog.insertMany(helper.initialBlogs.map(n => ({ ...n, user: user._id })))

  user.notes = user.blogs.concat(blogs.map(n => n._id))
  await user.save()

  USER_AUTH_TOKEN = helper.generateTestAuthToken(user)
})

test('correct number of blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
    .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })
    .expect(200)
    .expect('Content-Type', /application\/json/)
    
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('the unique identifier of the blog posts is id', async () => {
  const response = await api.get('/api/blogs')
    .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })

  expect(response.body[0].id).toBeDefined()
})

test('new blog can be added correctly', async () => {
    const newBlogPost = {
      title: "New post",
      author: "Artem Tsarev",
      url: "https://localhost/",
      likes: 1
    }

    await api.post('/api/blogs')
      .send(newBlogPost)
      .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const updatedBlogs = await helper.blogsinDB()
    expect(updatedBlogs).toHaveLength(helper.initialBlogs.length + 1)

    const titles = updatedBlogs.map((b) => b.title)
    expect(titles).toContain('New post')
})

test('new blog can be added without likes property', async () => {
  const newBlogPost = {
    title: "New post without likes",
    author: "Artem Tsarev",
    url: "https://localhost/"
  }

  const response = await api.post('/api/blogs')
    .send(newBlogPost)
    .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)
})

test('new blog cannot be added without url and title', async () => {
  const newBlogPost = {
    author: "Artem Tsarev",
    likes: 5
  }

  const response = await api.post('/api/blogs')
    .send(newBlogPost)
    .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })
    .expect(400)
})

test('new blog cannot be added without authorization', async () => {
  const newBlogPost = {
    title: "New post",
    author: "Artem Tsarev",
    url: "https://localhost/",
    likes: 1
  }

  const response = await api.post('/api/blogs')
    .send(newBlogPost)
    .expect(401)
})

test('blog can be removed', async () => {
  const blogs = await helper.blogsinDB()
  const blogToRemove = blogs[0]

  await api.delete(`/api/blogs/${blogToRemove.id}`)
    .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })
    .expect(204)

  const blogsAfter = await helper.blogsinDB()
  expect(blogsAfter).toHaveLength(blogs.length - 1)
  expect(blogsAfter.map(b => b.title)).not.toContain(blogToRemove.title)

})

test('blog can be updated', async () => {
  const blogs = await helper.blogsinDB()
  const blogToUpdate = {
    title: 'Updated title',
    author: blogs[0].author,
    url: blogs[0].url,
    likes: blogs[0].likes
  }

  const response = await api.put(`/api/blogs/${blogs[0].id}`)
    .send(blogToUpdate)
    .set({ 'Authorization': `Bearer ${USER_AUTH_TOKEN}` })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.title).toBe('Updated title')
})


afterAll(() => {
  mongoose.connection.close()
})