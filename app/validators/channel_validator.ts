import vine from '@vinejs/vine'
import { ChannelType } from '../enums/channel_type.js'

export const storeValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .minLength(3)
      .maxLength(63)
      .unique(async (query, field) => {
        const channel = await query.from('channels').where('name', field).first()
        return !channel
      }),
    type: vine.enum(Object.values(ChannelType)),
    avatar: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
  })
)

export const updateValidator = (channelId: number) =>
  vine.compile(
    vine.object({
      name: vine
        .string()
        .minLength(3)
        .maxLength(63)
        .unique(async (query, field) => {
          const channel = await query
            .from('channels')
            .where('name', field)
            .whereNot('id', channelId)
            .first()
          return !channel
        })
        .optional(),
      avatar: vine
        .file({
          size: '2mb',
          extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })
        .optional(),
    })
  )
