import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const RegisterController = () => import('#controllers/auth/register_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const MeController = () => import('#controllers/auth/me_controller')

const UsersController = () => import('#controllers/users_controller')
const ChannelsController = () => import('#controllers/channels_controller')
const MembersController = () => import('#controllers/members_controller')
const MessageController = () => import('#controllers/messages_controller')

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
    router.patch('user', [UsersController, 'update']).as('user.update')

    router.resource('channels', ChannelsController).apiOnly()
    router.post('channels/:id/messages', [MessageController, 'store']).as('messages.store')
    router.get('channels/:id/members', [MembersController, 'index']).as('members.index')
    router
      .delete('channels/:id/members/:nickname', [MembersController, 'destroy'])
      .as('members.destroy')
  })
  .use(middleware.auth())
  .prefix('api')
