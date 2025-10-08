import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const user = await User.create(payload)

    return User.accessTokens.create(user)
  }
}
