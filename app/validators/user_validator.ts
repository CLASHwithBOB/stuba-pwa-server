import vine from '@vinejs/vine'
import { UserStatus } from '../enums/user_status.js'

export const updateValidator = (userId: number) =>
  vine.compile(
    vine.object({
      nickname: vine
        .string()
        .minLength(3)
        .maxLength(63)
        .unique(async (query, field) => {
          const user = await query
            .from('users')
            .where('nickname', field)
            .whereNot('id', userId)
            .first()
          return !user
        })
        .optional(),
      status: vine.enum(Object.values(UserStatus)).optional(),
    })
  )
