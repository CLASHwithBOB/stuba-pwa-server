import { storeValidator, updateValidator } from '#validators/channel_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.user!

    const channels = await user.related('channels').query()

    return response.ok({ channels })
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const validated = await request.validateUsing(storeValidator)

    const channel = await user.related('channels').create(validated)

    return response.created({ channel })
  }

  async show({ response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user.related('channels').query().where('id', params.id).firstOrFail()

    return response.ok(channel)
  }

  async update({ request, response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user.related('channels').query().where('id', params.id).firstOrFail()

    const validated = await request.validateUsing(updateValidator(channel.id))

    channel.merge(validated)
    await channel.save()

    return response.ok(channel)
  }

  async destroy({ response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user.related('channels').query().where('id', params.id).firstOrFail()

    await channel.delete()

    return response.ok({ channel })
  }
}
