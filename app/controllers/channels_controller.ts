import Channel from '#models/channel'
import { storeValidator } from '#validators/channel_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { ChannelType } from '../enums/channel_type.js'

export default class ChannelsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.user!

    const channels = await user
      .related('memberChannels')
      .query()
      .whereNull('kicked_at')
      .orderBy('members.invited_recently', 'desc')

    const channelsData = channels.map((channel) => ({
      id: channel.id,
      userId: channel.userId,
      name: channel.name,
      type: channel.type,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
      invitedRecently: channel.$extras.pivot_invited_recently,
    }))

    return response.ok(channelsData)
  }

  //join
  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const validated = await request.validateUsing(storeValidator)

    let channel = await Channel.findBy({ name: validated.name })
    if (!channel) channel = await user.related('ownedChannels').create({ ...validated })
    else if (channel.type === ChannelType.PRIVATE)
      return response.badRequest({ message: 'Cannot join private channel' })

    channel.related('members').attach([user.id])

    return response.created(channel)
  }

  async show({ response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user
      .related('memberChannels')
      .query()
      .where('channels.id', params.id)
      .preload('members', (query) => {
        query.select(['id', 'nickname', 'avatar', 'status'])
      })
      .preload('messages', (query) => {
        query.orderBy('created_at', 'desc').limit(1)
      })
      .firstOrFail()

    if (channel.$extras.pivot_invited_recently) {
      await channel
        .related('members')
        .query()
        .where('user_id', user.id)
        .update({ invited_recently: false })
    }

    return response.ok(channel)
  }
}
