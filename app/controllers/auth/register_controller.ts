import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { UserStatus } from '../../enums/user_status.js'

export default class RegisterController {
  async store({ request }: HttpContext) {
    const validated = {
      ...(await request.validateUsing(registerValidator)),
      status: UserStatus.ONLINE,
      taggedNotificationsOnly: false,
    }

    const user = await User.create(validated)

    return User.accessTokens.create(user)
  }
}
