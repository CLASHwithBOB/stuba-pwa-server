import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  async store({ auth }: HttpContext) {
    const user = auth.user!

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return { message: 'success' }
  }
}
