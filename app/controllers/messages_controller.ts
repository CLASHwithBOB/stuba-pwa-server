import { storeValidator } from '#validators/message_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
  async store({ request, response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await user.related('channels').query().where('id', params.id).firstOrFail()

    const { content } = await request.validateUsing(storeValidator)

    const message = await channel.related('messages').create({ content, userId: user.id })

    return response.created({ message })
  }
}
