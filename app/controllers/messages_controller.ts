import { storeValidator } from '#validators/message_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
  async store({ request, response, auth, params }: HttpContext) {
    return response.notImplemented()
    // const user = auth.user!

    // const channel = await user
    //   .related('memberChannels')
    //   .query()
    //   .where('id', params.id)
    //   .firstOrFail()

    // const { content } = await request.validateUsing(storeValidator)

    // const message = await channel.related('').create({ content, userId: user.id })

    // return response.created({ message })
  }
}
