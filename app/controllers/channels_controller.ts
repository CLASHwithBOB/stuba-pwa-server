import Channel from '#models/channel'
import { storeValidator } from '#validators/channel_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { ChannelType } from '../enums/channel_type.js'

export default class ChannelsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.user!

    const channels = await user.related('memberChannels').query().whereNull('kicked_at')

    return response.ok(channels)
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
      .firstOrFail()

    return response.ok(channel)
  }
}
