const bcrypt = require('bcryptjs')
const User = require('../models/user')
const helper = require('./test_helper')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)

describe('when there are no users in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('creation fails with invalid user add request (userNoUsername)', async () => {

    const usersAtStart = await helper.usersInDb()

    const userNoUsername = {
      name: 'userNoUsername',
      password: 'sek'
    }

    const result = await api
      .post('/api/users')
      .send(userNoUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with invalid user add request (userUsernameTooShort)', async () => {

    const usersAtStart = await helper.usersInDb()

    const userUsernameTooShort = {
      name: 'userUsernameTooShort',
      username: 'us',
      password: 'sek'
    }

    const result = await api
      .post('/api/users')
      .send(userUsernameTooShort)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with invalid user add request (userNoPassword)', async () => {

    const usersAtStart = await helper.usersInDb()

    const userNoPassword = {
      name: 'userNoUsername',
      username: 'userNoUsername'
    }

    const result = await api
      .post('/api/users')
      .send(userNoPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with invalid user add request (userPasswordTooShort)', async () => {

    const usersAtStart = await helper.usersInDb()

    const userPasswordTooShort = {
      name: 'userPasswordTooShort',
      username: 'userPasswordTooShort',
      password: 'se'
    }

    const result = await api
      .post('/api/users')
      .send(userPasswordTooShort)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(() => {
  mongoose.connection.close()
})