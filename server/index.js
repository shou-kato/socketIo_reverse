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

  const user = {
    reverseBord: [
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 1, -1, 0, 0, 0, 3],
      [3, 0, 0, 0, -1, 1, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3]
    ],
    gameFlag: false,
    ready: false,
    moveOrder: null
  }

  const userRoom = {}

  // ソケットの作成
  const io = socket(server)
  // 接続された時の処理
  const socketStart = () => {
    socketConect()
  }

  const joinRoom = (socket) => {
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      socket.on('sendBord', (reverseBord, flag) => {
        flag = true
        socket.broadcast.to(roomId).emit('getBord', reverseBord, flag)
      })
    })
  }

  const makeRoom = (socket) => {
    socket.on('makeDutyId', () => {
      dutyRoom.push({
        id: roomingId(),
        number: null,
        idKey: roomingId()
      })
    })
  }

  const requestBord = (socket) => {
    socket.on('bordRequest', () => {
      for (let i = 0; i < dutyRoom.length; i++) {
        dutyRoom[i].number = socket.adapter.rooms[dutyRoom[i].id]
      }
      for (let i = 0; i < dutyRoom.length; i++) {
        if (typeof dutyRoom[i].number === 'undefined') dutyRoom[i].number = 0
      }
      socket.emit('res', dutyRoom)
    })
  }

  const h = (isSenkou, roomId) => {
    const ob = []
    if (isSenkou === false) return
    const a = Math.floor(Math.random() * Math.floor(10))
    if (a % 2 !== 0) {
      ob.push('先行', '後攻')
      io.to(roomId).emit('send', ob)
    } else {
      ob.push('後攻', '先行')
      io.to(roomId).emit('send', ob)
    }
  }

  const gameStart = (socket) => {
    // ゲーム開始通知
    socket.on('gameStart', (roomId) => {
      // もし相手のflagがfalse return
      socket.broadcast.to(roomId).emit('flagCheck')
      socket.on('ss', (redy) => {
        h(redy, roomId)
      })
    })
  }

  const createBord = (socket) => {
    socket.on('bordCreate', (roomId) => {
      userRoom[roomId] = user
    })
  }
  const socketConect = () => {
    io.sockets.on('connection', (socket) => {
      // 接続完了を通知
      socket.emit('connected')

      // ルームに参加する
      joinRoom(socket)

      // ルームを作成
      makeRoom(socket)

      // ボードをリクエストする
      requestBord(socket)

      // ゲームスタート
      gameStart(socket)

      socket.emit('resDutyRoom', dutyRoom)

      createBord(socket)
    })
  }
  socketStart()
}

start()
