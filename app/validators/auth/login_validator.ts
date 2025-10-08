import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .exists(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !!user
      }),
    password: vine.string().minLength(8).maxLength(255),
  })
)
