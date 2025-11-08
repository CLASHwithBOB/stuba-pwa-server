import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(1).maxLength(63),
    lastName: vine.string().minLength(1).maxLength(63),
    nickname: vine
      .string()
      .minLength(3)
      .maxLength(63)
      .regex(/^[a-z0-9_-]+$/)
      .unique(async (query, field) => {
        const user = await query.from('users').where('nickname', field).first()
        return !user
      }),
    email: vine
      .string()
      .email()
      .unique(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      }),
    password: vine.string().minLength(8).maxLength(255),
  })
)
