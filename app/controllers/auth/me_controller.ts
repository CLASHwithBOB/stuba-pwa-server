import type { HttpContext } from '@adonisjs/core/http'

export default class MeController {
  async index({ auth }: HttpContext) {
    return {
      user: auth.user,
    }
  }
}
