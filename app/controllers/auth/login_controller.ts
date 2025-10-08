import User from '#models/user'
import { loginValidator } from '#validators/auth/login_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async store({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    return User.accessTokens.create(user)
  }
}
