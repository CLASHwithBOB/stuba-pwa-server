import vine from '@vinejs/vine'
import { UserStatus } from '../enums/user_status.js'

export const updateValidator = (userId: number) =>
  vine.compile(
    vine.object({
      firstName: vine.string().minLength(1).maxLength(255).optional(),
      lastName: vine.string().minLength(1).maxLength(255).optional(),
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
      avatar: vine.string().url().nullable().optional(),
      taggedNotificationsOnly: vine.boolean().optional(),
    })
  )
