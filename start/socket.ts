import Message from '#models/message'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-channel', (channelId) => {
    console.log(`Socket ${socket.id} joined channel ${channelId}`)
    socket.join(`channel:${channelId}`)
  })

  socket.on('leave-channel', (channelId) => {
    console.log(`Socket ${socket.id} left channel ${channelId}`)
    socket.leave(`channel:${channelId}`)
  })

  socket.on('typing', ({ channelId, text, userId }) => {
    io.to(`channel:${channelId}`).emit('typing', {
      text,
      userId,
      channelId,
    })
  })

  socket.on('message', async ({ channelId, text, userId }) => {
    const message = await Message.create({
      channelId,
      content: text,
      userId,
    })

    io.to(`channel:${channelId}`).emit('message', message)
    io.to(`channel:${channelId}`).emit('typing', {
      text: '',
      userId,
      channelId,
    })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

httpServer.listen(3334, () => {
  console.log('Socket.IO server running on http://localhost:3334')
})

export default io
