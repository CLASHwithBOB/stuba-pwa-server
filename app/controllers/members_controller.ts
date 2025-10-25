import Channel from '#models/channel'
import ChannelKickVote from '#models/channel_kick_vote'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class MembersController {
  async destroy({ response, auth, params }: HttpContext) {
    const user = auth.user!

    const channel = await Channel.findOrFail(params.id)
    const target = await User.findByOrFail({ nickname: params.nickname })

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

    channel.related('users').detach([target.id])
    await ChannelKickVote.query()
      .where('channel_id', channel.id)
      .andWhere('target_user_id', target.id)
      .delete()

    return response.ok({ message: `${target.nickname} has been removed from the channel` })
  }
}
