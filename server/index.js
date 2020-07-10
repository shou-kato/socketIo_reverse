const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
// socket.io の require
const socket = require('socket.io')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)
  // Listen the server
  // サーバ情報を保存しておく
  const server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // ルームIDの生成
  const roomingId = () => {
    const length = 6
    const charset =
      'abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789'
    const passwordGenerator = () => {
      let password = ''
      for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }
      const includeAllTypes =
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
      return includeAllTypes ? password : passwordGenerator()
    }
    return passwordGenerator()
  }

  const waitingRoom = []

  // const readyNumber = {}

  const roomNumber = []

  // ソケットの作成
  const io = socket(server)
  // 接続された時の処理
  io.sockets.on('connection', (socket) => {
    // 接続完了を通知
    socket.emit('connected', socket.id)
    socket.on('createRoomId', () => {
      socket.emit('getRoomId', socket.id)
    })
    socket.on('joinRoom', (roomId) => {
      // todo
      // クライアントがサーバーに人数をリクエスト。人数を配列で。
      // サーバーはクライアントから受け取ったルームの名前を受け取り、
      // ルーム名を参照して、人数を数える。そして、その値を配列に入れていく。
      socket.join(roomId)
      socket.on('sendBord', (reverseBord) => {
        socket.broadcast.to(roomId).emit('getBord', reverseBord)
      })
    })

    socket.on('reqRoomNumber', () => {
      for (let i = 0; i < waitingRoom.length; i++) {
        roomNumber[i] = socket.adapter.rooms[waitingRoom[i]]
      }
       roomNumber.forEach((element) => {
        console.log(element)
       })
      socket.emit('sendRoomNumber', roomNumber)
    })

    // ルームの人数を数える
    // socket.on('selectJoinRoom', (selectRoomId) => {
    //   if (!readyNumber[selectRoomId]) {
    //     return (readyNumber[selectRoomId] = 1)
    //   } else {
    //     return (readyNumber[selectRoomId] += 1)
    //   }
    // })

    socket.emit('getWaitingRoom', waitingRoom)
    socket.on('createWaitingId', () => {
      waitingRoom.push(roomingId())
      socket.emit('getWaitingId', waitingRoom)
    })
  })
}
start()
