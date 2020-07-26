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
  const dutyRoom = []

  // ソケットの作成
  const io = socket(server)
  // 接続された時の処理
  io.sockets.on('connection', (socket) => {
    // 接続完了を通知
    socket.emit('connected')
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      socket.on('sendBord', (reverseBord, flag) => {
        flag = true
        socket.broadcast.to(roomId).emit('getBord', reverseBord, flag)
      })
    })

    socket.on('req', () => {
      for (let i = 0; i < dutyRoom.length; i++) {
        dutyRoom[i].number = socket.adapter.rooms[dutyRoom[i].id]
      }
      for (let i = 0; i < dutyRoom.length; i++) {
        if (typeof dutyRoom[i].number === 'undefined') dutyRoom[i].number = 0
      }
      socket.emit('res', dutyRoom)
    })
    // ルームを作成
    socket.on('makeDutyId', () => {
      dutyRoom.push({
        id: roomingId(),
        number: null,
        idKey: roomingId()
      })
    })

    socket.emit('resDutyRoom', dutyRoom)
    socket.on('test', () => {
      socket.emit('test1', dutyRoom)
    })

    // ゲーム開始通知
    socket.on('readyGo', (roomId) => {
      // もし相手のflagがfalse return
      socket.broadcast.to(roomId).emit('flagCheck')
      socket.on('ss', (redy) => {
        if (redy === false) return 0
        const a = Math.floor(Math.random() * Math.floor(10))
        if (a % 2 !== 0) {
          const ob = []
          console.log('奇数')
          ob.push('先行', '後攻')
          io.to(roomId).emit('send', ob)
        } else {
          const ob = []
          console.log('偶数')
          ob.push('後攻', '先行')
          io.to(roomId).emit('send', ob)
        }
      })
    })
  })
}
start()
