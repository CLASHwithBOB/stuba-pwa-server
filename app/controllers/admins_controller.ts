import Channel from '#models/channel'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { ChannelType } from '../enums/channel_type.js'
import socket from '../../start/socket.js'

export default class AdminsController {
  //revoke
  async update({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)

    if (channel.type !== ChannelType.PRIVATE) {
      return response.badRequest({
        message: 'Revoke command can only be used inside of private channels',
      })
    }

    if (channel.userId !== user.id) {
      return response.badRequest({
        message: 'Only the channel admin can revoke members',
      })
    }

    const target = await User.findBy({ nickname: params.nickname })
    if (!target) {
      return response.notFound({ message: `User ${params.nickname} not found` })
    }

    const channelUser = await channel.related('members').query().where('user_id', target.id).first()
    if (!channelUser) {
      return response.notFound({ message: `${target.nickname} is not a member of the channel` })
    }

    if (user.id === target.id) {
      return response.badRequest({ message: 'You cannot remove yourself from the channel' })
    }

    if (channel.userId === target.id) {
      return response.badRequest({
        message: 'You cannot remove the channel admin from the channel',
      })
    }

    await channel.related('members').query().where('user_id', target.id).delete()

    socket.to(`user:${target.id}`).emit('channel-kick')

    return response.ok({ message: `${target.nickname} has been removed from the channel` })
  }

  //quit
  async destroy({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)

    if (channel.userId !== user.id) {
      return response.badRequest({ message: `You are not the channel admin` })
    }

    await channel.delete()

    return response.ok({ message: `You have deleted the channel` })
  }
}
