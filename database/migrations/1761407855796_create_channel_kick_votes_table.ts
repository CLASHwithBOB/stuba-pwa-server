import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channel_kick_votes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('channel_id').references('id').inTable('channels').onDelete('CASCADE')
      table.integer('target_user_id').references('id').inTable('users').onDelete('CASCADE')
      table.integer('voter_user_id').references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['channel_id', 'target_user_id', 'voter_user_id'])
      table.index(['channel_id', 'target_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
