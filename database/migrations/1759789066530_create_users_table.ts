import { BaseSchema } from '@adonisjs/lucid/schema'
import { UserStatus } from '../../app/enums/user_status.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable()

      table.string('nickname').notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.enum('status', [UserStatus.ONLINE, UserStatus.DND, UserStatus.OFFLINE]).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
