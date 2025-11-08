import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { UserStatus } from '../../app/enums/user_status.js'

test.group('User - Read (Me)', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should get current user information', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: 'https://example.com/avatar.jpg',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.get('/auth/me').bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: user.id,
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'johndoe',
        email: 'john.doe@example.com',
        status: UserStatus.ONLINE,
      },
    })

    const body = response.body()
    assert.isUndefined(body.user.password)
  })

  test('should fail to get user info without authentication', async ({ client }) => {
    const response = await client.get('/auth/me')

    response.assertStatus(401)
  })

  test('should return correct user status', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.DND,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.get('/auth/me').bearerToken(token.value!.release())

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.user.status, UserStatus.DND)
  })
})

test.group('User - Update', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should update user first name', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      firstName: 'Johnny',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      firstName: 'Johnny',
    })

    await user.refresh()
    assert.equal(user.firstName, 'Johnny')
  })

  test('should update user last name', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      lastName: 'Smith',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      lastName: 'Smith',
    })

    await user.refresh()
    assert.equal(user.lastName, 'Smith')
  })

  test('should update user nickname', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      nickname: 'john_doe_2024',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      nickname: 'john_doe_2024',
    })

    await user.refresh()
    assert.equal(user.nickname, 'john_doe_2024')
  })

  test('should update user status', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      status: UserStatus.DND,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      status: UserStatus.DND,
    })

    await user.refresh()
    assert.equal(user.status, UserStatus.DND)
  })

  test('should update user avatar', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      avatar: 'https://example.com/new-avatar.jpg',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      avatar: 'https://example.com/new-avatar.jpg',
    })

    await user.refresh()
    assert.equal(user.avatar, 'https://example.com/new-avatar.jpg')
  })

  test('should update multiple fields at once', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      firstName: 'Johnny',
      lastName: 'Smith',
      status: UserStatus.OFFLINE,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      firstName: 'Johnny',
      lastName: 'Smith',
      status: UserStatus.OFFLINE,
    })

    await user.refresh()
    assert.equal(user.firstName, 'Johnny')
    assert.equal(user.lastName, 'Smith')
    assert.equal(user.status, UserStatus.OFFLINE)
  })

  test('should fail to update with duplicate nickname', async ({ client }) => {
    await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      nickname: 'janesmith',
    })

    response.assertStatus(422)
  })

  test('should fail to update with invalid status', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      status: 'invalid_status',
    })

    response.assertStatus(422)
  })

  test('should fail to update with invalid avatar URL', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      avatar: 'not-a-valid-url',
    })

    response.assertStatus(422)
  })

  test('should fail to update without authentication', async ({ client }) => {
    const response = await client.patch('/api/user').json({
      firstName: 'Johnny',
    })

    response.assertStatus(401)
  })

  test('should fail to update with invalid token', async ({ client }) => {
    const response = await client.patch('/api/user').bearerToken('invalid-token').json({
      firstName: 'Johnny',
    })

    response.assertStatus(401)
  })

  test('should fail to update with too short nickname', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      nickname: 'ab',
    })

    response.assertStatus(422)
  })

  test('should fail to update with too long nickname', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)
    const tooLongNickname = 'ab'.repeat(65)

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      nickname: tooLongNickname,
    })

    response.assertStatus(422)
  })

  test('should not update email or password', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)
    const originalEmail = user.email
    const originalPassword = user.password

    const response = await client.patch('/api/user').bearerToken(token.value!.release()).json({
      email: 'newemail@example.com',
      password: 'newpassword123',
      firstName: 'Johnny',
    })

    response.assertStatus(200)

    await user.refresh()
    assert.equal(user.email, originalEmail)
    assert.equal(user.password, originalPassword)
    assert.equal(user.firstName, 'Johnny')
  })
})

test.group('User - Create (via Registration)', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should create a new user via registration', async ({ client, assert }) => {
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

  test('should fail to create user with existing email', async ({ client, assert }) => {
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const response = await client.post('/auth/register').json({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'john.doe@example.com',
      password: 'password123',
    })

    response.assertStatus(422)

    const users = await User.query().where('email', 'john.doe@example.com')
    assert.lengthOf(users, 1)
  })

  test('should fail to create user with existing nickname', async ({ client, assert }) => {
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const response = await client.post('/auth/register').json({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'johndoe',
      email: 'jane.smith@example.com',
      password: 'password123',
    })

    response.assertStatus(422)

    const users = await User.query().where('nickname', 'johndoe')
    assert.lengthOf(users, 1)
  })
})

test.group('User - Delete (via Logout/Token Revocation)', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should delete user access token on logout', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
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

  test('should verify user still exists after logout', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    await client.delete('/auth/logout').bearerToken(token.value!.release())

    const existingUser = await User.find(user.id)
    assert.isNotNull(existingUser)
    assert.equal(existingUser?.email, 'john.doe@example.com')
  })

  test('should revoke all user tokens', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      avatar: null,
      status: UserStatus.ONLINE,
    })

    const token1 = await User.accessTokens.create(user)
    const token2 = await User.accessTokens.create(user)
    const token3 = await User.accessTokens.create(user)

    let tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 3)

    await client.delete('/auth/logout').bearerToken(token1.value!.release())

    tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 2)

    await client.delete('/auth/logout').bearerToken(token2.value!.release())

    tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 1)

    await client.delete('/auth/logout').bearerToken(token3.value!.release())

    tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 0)
  })
})
