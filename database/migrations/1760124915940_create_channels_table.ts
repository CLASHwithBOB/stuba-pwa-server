import { BaseSchema } from '@adonisjs/lucid/schema'
import { ChannelType } from '../../app/enums/channel_type.js'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable()
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').index()

      table.string('name').notNullable().unique()
      table.string('avatar_url').nullable()
      table.enum('type', [ChannelType.PUBLIC, ChannelType.PRIVATE]).notNullable().index()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
