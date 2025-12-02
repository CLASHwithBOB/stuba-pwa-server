import Message from '#models/message'
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
  async index({ request, params }: HttpContext) {
    const channelId = params.id
    const beforeId = request.input('beforeId')

    const query = Message.query()
      .where('channel_id', channelId)
      .orderBy('id', 'desc')
      .limit(20)
      .if(beforeId, (q) => {
        q.where('id', '<', beforeId)
      })

    const messages = await query
    return messages.reverse()
  }
}
