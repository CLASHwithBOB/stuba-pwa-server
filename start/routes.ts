import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const RegisterController = () => import('#controllers/auth/register_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const MeController = () => import('#controllers/auth/me_controller')

const UserController = () => import('#controllers/user_controller')
const ChannelController = () => import('#controllers/channel_controller')

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

router
  .group(() => {
    router.patch('user', [UserController, 'update']).as('user.update')

    router.get('channels', [ChannelController, 'index']).as('channel.index')
    router.post('channels', [ChannelController, 'store']).as('channel.store')
    router.patch('channels/:id', [ChannelController, 'update']).as('channel.update')
    router.delete('channels/:id', [ChannelController, 'destroy']).as('channel.destroy')
  })
  .use(middleware.auth())
  .prefix('api')
