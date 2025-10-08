import router from '@adonisjs/core/services/router'

const RegisterController = () => import('#controllers/auth/register_controller')
const LoginController = () => import('#controllers/auth/login_controller')

router
  .group(() => {
    router.post('register', [RegisterController, 'store'])
    router.post('login', [LoginController, 'store'])
  })
  .prefix('auth')
