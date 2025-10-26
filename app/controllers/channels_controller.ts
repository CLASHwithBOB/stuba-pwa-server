import { storeValidator, updateValidator } from '#validators/channel_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.user!

    const channels = await user.related('memberChannels').query()

    return response.ok(channels)
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const validated = await request.validateUsing(storeValidator)

    const channel = await user.related('ownedChannels').create({ ...validated })
    channel.related('members').attach([user.id])

    return response.created(channel)
  }

  async show({ response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user
      .related('memberChannels')
      .query()
      .where('id', params.id)
      .firstOrFail()

    return response.ok(channel)
  }

  async update({ request, response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user.related('ownedChannels').query().where('id', params.id).firstOrFail()

    const validated = await request.validateUsing(updateValidator(channel.id))

    channel.merge(validated)
    await channel.save()

    return response.ok(channel)
  }

  async destroy({ response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user.related('ownedChannels').query().where('id', params.id).firstOrFail()

    await channel.delete()

    return response.ok(channel)
  }
}
