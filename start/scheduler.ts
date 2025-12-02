import scheduler from 'adonisjs-scheduler/services/main'
import DeleteInactiveChannels from '../commands/delete_inactive_channels.js'

scheduler.command(DeleteInactiveChannels).daily().at('03:00')
