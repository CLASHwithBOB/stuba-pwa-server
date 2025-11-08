import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { UserStatus } from '../enums/user_status.js'
import Channel from './channel.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import ChannelKickVote from './channel_kick_vote.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare nickname: string

  @column()
  declare email: string

  @column()
  declare avatar: string | null

  @column()
  declare status: UserStatus

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => Channel)
  declare ownedChannels: HasMany<typeof Channel>

  @manyToMany(() => Channel, {
    pivotTable: 'members',
    pivotColumns: ['kicked_at', 'created_at', 'updated_at'],
  })
  declare memberChannels: ManyToMany<typeof Channel>

  @hasMany(() => ChannelKickVote, {
    foreignKey: 'targetUserId',
  })
  declare kickVotesReceived: HasMany<typeof ChannelKickVote>
}
