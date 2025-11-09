import Channel from '#models/channel'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminsController {
  //quit
  async destroy({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)

    if (channel.userId !== user.id) {
      return response.badRequest({ message: `You are not the channel admin` })
    }

    await channel.delete()

    return response.ok({ message: `You have deleted the channel` })
  }
}
