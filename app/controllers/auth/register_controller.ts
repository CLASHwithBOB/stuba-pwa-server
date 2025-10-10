import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { UserStatus } from '../../enums/user_status.js'

export default class RegisterController {
  async store({ request }: HttpContext) {
    const payload = {
      ...(await request.validateUsing(registerValidator)),
      status: UserStatus.ONLINE,
    }

    const user = await User.create(payload)

    return User.accessTokens.create(user)
  }
}
