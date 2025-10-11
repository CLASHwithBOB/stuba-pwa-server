import { storeValidator, updateValidator } from '#validators/channel_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelController {
  async index({ response, auth }: HttpContext) {
    const user = auth.user!

    const channels = await user.related('channels').query()

    return response.json({ channels })
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const { name, type, avatar } = await request.validateUsing(storeValidator)

    const channel = await user.related('channels').create({ name, type })

    return response.created({ channel })
  }

  async update({ request, response, auth, params }: HttpContext) {
    const user = auth.user!
    const channel = await user.related('channels').query().where('id', params.id).firstOrFail()

    const { name, avatar } = await request.validateUsing(updateValidator(channel.id))

    channel.merge({ name })
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
