<template lang="pug">
  div
    p  ゲームルームIDはこちらです {{ roomId }}
    button(@click="createRoom") ルームIDを作成する
    button(@click="gameStart") ゲームを開始する
    P(v-if="turn == 1") black
    p(v-else) white
    input(v-model="inputText")
    canvas( id="canvas" width="1000" height="1000" )
</template>
<script>
import io from 'socket.io-client'
export default {
  data() {
    return {
      bord: [
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
      turn: 1,
      socket: io(),
      roomId: '',
      inputText: '',
      count: 0,
      gameFlag: false
    }
  },
  mounted() {
    this.init()
    this.mainProcess()
    this.socket.on('connected', (socketId) => {})
    this.socket.on('sendBord', (a) => {
      this.bord = a
      this.pushStone()
    })
    this.socket.on('sendTurn', (turn, gameFlag) => {
      this.turn = turn
      this.gameFlag = gameFlag
    })
    console.log(this.gameFlag)
  },
  methods: {
    init() {
      this.rect()
      this.pushStone()
    },
    rect() {
      const canvas = document.getElementById('canvas')
      const ctx = canvas.getContext('2d')
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          ctx.strokeRect(50 * i + 50, 50 * j + 50, 50, 50)
        }
      }
    },
    pushStone() {
      const canvas = document.getElementById('canvas')
      const ctx = canvas.getContext('2d')
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          ctx.beginPath()
          ctx.arc(50 * x + 25, 50 * y + 25, 20, 0, 2 * Math.PI, false)

          switch (this.bord[y][x]) {
            case -1:
              ctx.fillStyle = 'blue'
              break
            case 0:
              ctx.fillStyle = 'white'
              break
            case 1:
              ctx.fillStyle = 'black'
              break
            case 3:
              ctx.fillStyle = 'white'
              break
          }
          ctx.fill()
        }
      }
    },
    mainProcess() {
      /**
       *  @param {Number} yCoordinate  見てる y座標
       *  @param {Number} xCoordinate  見てる y座標
       */
      const canvas = document.getElementById('canvas')
      // 座標取得
      canvas.addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect()
        const xCoordinate = Math.floor((e.clientX - rect.left) / 50)
        const yCoordinate = Math.floor((e.clientY - rect.top) / 50)
        if (!this.gameFlag) {
          return
        }
        // すでに同じ色では無くて、置いた値が 1 or -1なら早期リターン
        if (
          this.bord[yCoordinate][xCoordinate] === 1 ||
          this.bord[yCoordinate][xCoordinate] === -1
        ) {
          return
        }
        this.bord[yCoordinate][xCoordinate] = this.turn
        this.invertStone(yCoordinate, xCoordinate, 0, 1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 0, -1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 1, 0, this.turn)
        this.invertStone(yCoordinate, xCoordinate, -1, 0, this.turn)
        this.invertStone(yCoordinate, xCoordinate, -1, -1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 1, 1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, -1, 1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 1, -1, this.turn)
        if (this.count === 0) {
          this.bord[yCoordinate][xCoordinate] = 0
          this.count = 0
          return 0
          // 石をひっくり返せた場合
        } else {
          this.count = 0
        }
        this.pushStone()
        this.turn *= -1
        this.socket.emit(
          'sendId',
          this.bord,
          this.inputText,
          this.turn,
          this.gameFlag
        )
        // 修正必要
        console.log((this.gameFlag = false))
      })
    },
    /**
     * @param {Number} y  見てる y座標
     * @param {Number} x  見てる y座標
     * @param {Number} dy 動く  y方向
     * @param {Number} dx 動く  x座標
     * @param {Number} c  色
     */
    invertStone(y, x, dy, dx, c) {
      if (this.bord[y + dy][x + dx] === c) {
        this.bord[y][x] = c
        return 1
      }
      if (this.bord[y + dy][x + dx] === -c) {
        const n = this.invertStone(y + dy, x + dx, dy, dx, c)
        if (n === 0) {
          return 0
        }
        this.bord[y][x] = c
        this.count += 1
        return n + 1
      }
    },
    createRoom() {
      this.socket.emit('createRoomId')
      this.socket.on('getRoomId', (id) => {
        this.roomId = id
      })
    },
    gameStart() {
      console.log('game')
      this.gameFlag = true
    }
  }
}
</script>
<style></style>
