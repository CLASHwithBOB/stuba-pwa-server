import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Channel from '#models/channel'
import { UserStatus } from '../../app/enums/user_status.js'
import { ChannelType } from '../../app/enums/channel_type.js'

test.group('Channel - Create', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should create a public channel successfully', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'general',
      type: ChannelType.PUBLIC,
    })

    response.assertStatus(201)
    response.assertBodyContains({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: user.id,
    })

    const channel = await Channel.findBy('name', 'general')
    assert.isNotNull(channel)
    assert.equal(channel?.name, 'general')
    assert.equal(channel?.type, ChannelType.PUBLIC)
    assert.equal(channel?.userId, user.id)
  })

  test('should create a private channel successfully', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'private-room',
      type: ChannelType.PRIVATE,
    })

    response.assertStatus(201)
    response.assertBodyContains({
      name: 'private-room',
      type: ChannelType.PRIVATE,
    })

    const channel = await Channel.findBy('name', 'private-room')
    assert.equal(channel?.type, ChannelType.PRIVATE)
  })

  test('should automatically add creator as member', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'test-channel',
      type: ChannelType.PUBLIC,
    })

    response.assertStatus(201)

    const channel = await Channel.findBy('name', 'test-channel')
    await channel?.load('members')

    assert.equal(channel?.members.length, 1)
    assert.equal(channel?.members[0].id, user.id)
  })

  test('should fail to create a private channel with duplicate name', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    await Channel.create({
      name: 'general',
      type: ChannelType.PRIVATE,
      userId: user.id,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'general',
      type: ChannelType.PUBLIC,
    })

    response.assertStatus(400)
  })

  test('should fail to create channel with short name', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'ab',
      type: ChannelType.PUBLIC,
    })

    response.assertStatus(422)
  })

  test('should fail to create channel with too long name', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)
    const longName = 'a'.repeat(65)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: longName,
      type: ChannelType.PUBLIC,
    })

    response.assertStatus(422)
  })

  test('should fail to create channel with invalid type', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'test-channel',
      type: 'invalid-type',
    })

    response.assertStatus(422)
  })

  test('should fail to create channel without authentication', async ({ client }) => {
    const response = await client.post('/api/channels').json({
      name: 'test-channel',
      type: ChannelType.PUBLIC,
    })

    response.assertStatus(401)
  })

  test('should fail to create channel with missing fields', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.post('/api/channels').bearerToken(token.value!.release()).json({
      name: 'test-channel',
    })

    response.assertStatus(422)
  })
})

test.group('Channel - Read', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should get all channels user is member of', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel1 = await Channel.create({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: user.id,
    })

    const channel2 = await Channel.create({
      name: 'random',
      type: ChannelType.PUBLIC,
      userId: user.id,
    })

    await user.related('memberChannels').attach([channel1.id, channel2.id])

    const token = await User.accessTokens.create(user)

    const response = await client.get('/api/channels').bearerToken(token.value!.release())

    response.assertStatus(200)

    const body = response.body()
    assert.lengthOf(body, 2)
    assert.includeDeepMembers(
      body.map((c: any) => c.name),
      ['general', 'random']
    )
  })

  test('should only return channels user is member of', async ({ client, assert }) => {
    const user1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const user2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel1 = await Channel.create({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: user1.id,
    })

    const channel2 = await Channel.create({
      name: 'private',
      type: ChannelType.PRIVATE,
      userId: user2.id,
    })

    await user1.related('memberChannels').attach([channel1.id])
    await user2.related('memberChannels').attach([channel2.id])

    const token = await User.accessTokens.create(user1)

    const response = await client.get('/api/channels').bearerToken(token.value!.release())

    response.assertStatus(200)

    const body = response.body()
    assert.lengthOf(body, 1)
    assert.equal(body[0].name, 'general')
  })

  test('should get specific channel by id', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel = await Channel.create({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: user.id,
    })

    await user.related('memberChannels').attach([channel.id])

    const token = await User.accessTokens.create(user)

    const response = await client
      .get(`/api/channels/${channel.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(200)
    response.assertBodyContains({
      id: channel.id,
      name: 'general',
      type: ChannelType.PUBLIC,
    })
  })

  test('should fail to get channel user is not member of', async ({ client }) => {
    const user1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const user2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel = await Channel.create({
      name: 'private',
      type: ChannelType.PRIVATE,
      userId: user2.id,
    })

    await user2.related('memberChannels').attach([channel.id])

    const token = await User.accessTokens.create(user1)

    const response = await client
      .get(`/api/channels/${channel.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(404)
  })

  test('should fail to get channels without authentication', async ({ client }) => {
    const response = await client.get('/api/channels')

    response.assertStatus(401)
  })

  test('should return empty array when user has no channels', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.get('/api/channels').bearerToken(token.value!.release())

    response.assertStatus(200)

    const body = response.body()
    assert.lengthOf(body, 0)
  })
})

test.group('Channel - Delete', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should delete channel as owner', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel = await Channel.create({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: user.id,
    })

    const token = await User.accessTokens.create(user)

    const response = await client
      .delete(`/api/channels/${channel.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(200)

    const deletedChannel = await Channel.find(channel.id)
    assert.isNull(deletedChannel)
  })

  test('should fail to delete channel if not owner', async ({ client, assert }) => {
    const owner = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const member = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel = await Channel.create({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: owner.id,
    })

    await member.related('memberChannels').attach([channel.id])

    const token = await User.accessTokens.create(member)

    const response = await client
      .delete(`/api/channels/${channel.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(400)

    const existingChannel = await Channel.find(channel.id)
    assert.isNotNull(existingChannel)
  })

  test('should fail to delete non-existent channel', async ({ client }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const token = await User.accessTokens.create(user)

    const response = await client.delete('/api/channels/99999').bearerToken(token.value!.release())

    response.assertStatus(404)
  })

  test('should fail to delete channel without authentication', async ({ client }) => {
    const response = await client.delete('/api/channels/1')

    response.assertStatus(401)
  })

  test('should delete channel with members', async ({ client, assert }) => {
    const owner = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const member = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password123',
      status: UserStatus.ONLINE,
    })

    const channel = await Channel.create({
      name: 'general',
      type: ChannelType.PUBLIC,
      userId: owner.id,
    })

    await owner.related('memberChannels').attach([channel.id])
    await member.related('memberChannels').attach([channel.id])

    const token = await User.accessTokens.create(owner)

    const response = await client
      .delete(`/api/channels/${channel.id}`)
      .bearerToken(token.value!.release())

    response.assertStatus(200)

    const deletedChannel = await Channel.find(channel.id)
    assert.isNull(deletedChannel)
  })
})
