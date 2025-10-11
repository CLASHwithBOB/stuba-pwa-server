import { updateValidator } from '#validators/user_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  async update({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const data = await request.validateUsing(updateValidator(user.id))

    user.merge(data)
    await user.save()

    return response.ok(user)
  }
}
