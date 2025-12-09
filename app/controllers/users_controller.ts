import { updateValidator } from '#validators/user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import socket from '../../start/socket.js'

export default class UsersController {
  async update({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const data = await request.validateUsing(updateValidator(user.id))

    user.merge(data)
    await user.save()

    socket.emit('user-updated', user.id)

    return response.ok(user)
  }
}
