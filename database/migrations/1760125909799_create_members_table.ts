import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('channel_id').references('id').inTable('channels').onDelete('CASCADE').index()
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').index()

      table.timestamp('kicked_at').nullable()
      table.boolean('invited_recently').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['channel_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
