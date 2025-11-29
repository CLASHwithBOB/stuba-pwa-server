import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { ChannelType } from '../enums/channel_type.js'
import Message from './message.js'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare type: ChannelType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare owner: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'members',
    pivotColumns: ['kicked_at', 'invited_recently', 'created_at', 'updated_at'],
  })
  declare members: ManyToMany<typeof User>

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>
}
