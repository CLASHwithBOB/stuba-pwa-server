import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { UserStatus } from '../../app/enums/user_status.js'

test.group('Auth - Register', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should register a new user successfully', async ({ client, assert }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
    }

    const response = await client.post('/auth/register').json(userData)

    response.assertStatus(200)
    response.assertBodyContains({
      type: 'bearer',
    })

    const user = await User.findBy('email', userData.email)
    assert.isNotNull(user)
    assert.equal(user?.firstName, userData.firstName)
    assert.equal(user?.lastName, userData.lastName)
    assert.equal(user?.nickname, userData.nickname)
    assert.equal(user?.email, userData.email)
    assert.equal(user?.status, UserStatus.ONLINE)
  })

  test('should fail to register with duplicate email', async ({ client, assert }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
    }

    await User.create({ ...userData, status: UserStatus.ONLINE })

    const response = await client.post('/auth/register').json({
      ...userData,
      nickname: 'johndoe2',
    })

    response.assertStatus(422)
    const users = await User.query().where('email', userData.email)
    assert.lengthOf(users, 1)
  })

  test('should fail to register with duplicate nickname', async ({ client, assert }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
    }

    await User.create({ ...userData, status: UserStatus.ONLINE })

    const response = await client.post('/auth/register').json({
      ...userData,
      email: 'different@example.com',
    })

    response.assertStatus(422)
    const users = await User.query().where('nickname', userData.nickname)
    assert.lengthOf(users, 1)
  })

  test('should fail to register with invalid nickname format', async ({ client }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'John Doe!',
      email: 'john.doe@example.com',
      password: 'password123',
    }

    const response = await client.post('/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail to register with short password', async ({ client }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'pass',
    }

    const response = await client.post('/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail to register with invalid email', async ({ client }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'invalid-email',
      password: 'password123',
    }

    const response = await client.post('/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail to register with missing required fields', async ({ client }) => {
    const response = await client.post('/auth/register').json({
      firstName: 'John',
    })

    response.assertStatus(422)
  })
})

test.group('Auth - Login', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should login with valid credentials', async ({ client, assert }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    }

    await User.create(userData)

    const response = await client.post('/auth/login').json({
      email: userData.email,
      password: userData.password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      type: 'bearer',
    })

    const body = response.body()
    assert.properties(body, ['type', 'token'])
    assert.equal(body.type, 'bearer')
    assert.isString(body.token)
  })

  test('should fail to login with incorrect password', async ({ client }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    }

    await User.create(userData)

    const response = await client.post('/auth/login').json({
      email: userData.email,
      password: 'wrongpassword',
    })

    response.assertStatus(400)
  })

  test('should fail to login with non-existent email', async ({ client }) => {
    const response = await client.post('/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should fail to login with invalid email format', async ({ client }) => {
    const response = await client.post('/auth/login').json({
      email: 'invalid-email',
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should fail to login with missing credentials', async ({ client }) => {
    const response = await client.post('/auth/login').json({})

    response.assertStatus(422)
  })
})

test.group('Auth - Logout', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should logout successfully with valid token', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.delete('/auth/logout').bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'success',
    })

    const tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 0)
  })

  test('should fail to logout without authentication', async ({ client }) => {
    const response = await client.delete('/auth/logout')

    response.assertStatus(401)
  })

  test('should fail to logout with invalid token', async ({ client }) => {
    const response = await client.delete('/auth/logout').bearerToken('invalid-token')

    response.assertStatus(401)
  })
})

test.group('Auth - Me', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should return current user info with valid token', async ({ client, assert }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    }

    const user = await User.create(userData)
    const token = await User.accessTokens.create(user)

    const response = await client.get('/auth/me').bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        nickname: userData.nickname,
        email: userData.email,
        status: userData.status,
      },
    })

    const body = response.body()
    assert.isUndefined(body.user.password)
  })

  test('should fail to get user info without authentication', async ({ client }) => {
    const response = await client.get('/auth/me')

    response.assertStatus(401)
  })

  test('should fail to get user info with invalid token', async ({ client }) => {
    const response = await client.get('/auth/me').bearerToken('invalid-token')

    response.assertStatus(401)
  })
})
