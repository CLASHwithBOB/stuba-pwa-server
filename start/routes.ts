import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const RegisterController = () => import('#controllers/auth/register_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const MeController = () => import('#controllers/auth/me_controller')

router
  .group(() => {
    router.post('register', [RegisterController, 'store']).as('register')
    router.post('login', [LoginController, 'store']).as('login')

    router
      .group(() => {
        router.delete('logout', [LogoutController, 'destroy']).as('logout')
        router.get('me', [MeController, 'index']).as('me')
      })
      .use(middleware.auth())
  })
  .prefix('auth')
  .as('auth.')
