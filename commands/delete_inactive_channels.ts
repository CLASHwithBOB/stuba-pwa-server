import Channel from '#models/channel'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'

export default class DeleteInactiveChannels extends BaseCommand {
  static commandName = 'delete:inactive-channels'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    const threshold = DateTime.now().minus({ days: 30 })

    const channelsToDelete = await Channel.query()
      .leftJoin('messages', 'channels.id', 'messages.channel_id')
      .groupBy('channels.id')
      .havingRaw('MAX(messages.created_at) < ?', [threshold.toSQL()])
      .select('channels.id', 'channels.name')

    for (const channel of channelsToDelete) {
      await Channel.query().where('id', channel.id).delete()
    }
  }
}
