import vine from '@vinejs/vine'
import { ChannelType } from '../enums/channel_type.js'

export const storeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(63),
    type: vine.enum(Object.values(ChannelType)),
  })
)
