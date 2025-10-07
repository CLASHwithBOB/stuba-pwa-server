import router from '@adonisjs/core/services/router'

const RegisterController = () => import('#controllers/auth/register_controller')

router
  .group(() => {
    router.post('register', [RegisterController, 'store'])
  })
  .prefix('auth')
