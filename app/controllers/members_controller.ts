import Channel from '#models/channel'
import ChannelKickVote from '#models/channel_kick_vote'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { ChannelType } from '../enums/channel_type.js'

export default class MembersController {
  //list
  async index({ response, params }: HttpContext) {
    const channel = await Channel.findOrFail(params.id)

    const members = await channel.related('members').query().whereNull('kicked_at')

    return response.ok(members)
  }

  //invite
  async store({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)

    if (channel.type === ChannelType.PRIVATE && channel.userId !== user.id) {
      return response.badRequest({
        message: 'Only the channel admin can invite members to a private channel',
      })
    }

    const target = await User.findBy({ nickname: params.nickname })
    if (!target) {
      return response.notFound({ message: `User ${params.nickname} not found` })
    }

    const channelUser = await channel.related('members').query().where('user_id', target.id).first()

    if (!channelUser) {
      await channel.related('members').attach({
        [target.id]: {
          invitedRecently: true,
        },
      })
    } else if (channelUser.$extras.pivot_kicked_at === null) {
      return response.badRequest({
        message: `${target.nickname} is already a member of the channel`,
      })
    } else if (channel.userId === user.id) {
      await channel
        .related('members')
        .query()
        .where('user_id', target.id)
        .update({ kicked_at: null })
    } else {
      return response.badRequest({
        message: 'Only the channel admin can re-invite a kicked member',
      })
    }

    return response.ok({ message: `${target.nickname} has been added to the channel` })
  }

  //cancel
  async update({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)

    const channelUser = await channel.related('members').query().where('user_id', user.id).first()
    if (!channelUser) {
      return response.notFound({ message: `You are not a member of the channel` })
    }

    if (channel.userId === user.id) {
      await channel.delete()

      return response.ok({ message: `You have deleted the channel` })
    }

    await channel.related('members').query().where('user_id', user.id).delete()

    return response.ok({ message: `You have left the channel` })
  }

  //kick
  async destroy({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)

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

    const voteCountQuery = await ChannelKickVote.query()
      .where('channel_id', channel.id)
      .andWhere('target_user_id', target.id)
      .andWhereNot('voter_user_id', user.id)
      .count('* as count')
      .firstOrFail()

    const voteCount = Number(voteCountQuery?.$extras.count)
    if (channel.userId !== user.id && voteCount < 2) {
      await ChannelKickVote.firstOrCreate({
        channelId: channel.id,
        targetUserId: target.id,
        voterUserId: user.id,
      })

      return response.ok({
        message: `${2 - voteCount} votes left before you can kick ${target.nickname}`,
      })
    }

    await channel
      .related('members')
      .query()
      .where('user_id', target.id)
      .update({ kicked_at: new Date() })
    await ChannelKickVote.query()
      .where('channel_id', channel.id)
      .andWhere('target_user_id', target.id)
      .delete()

    return response.ok({ message: `${target.nickname} has been removed from the channel` })
  }
}
