<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col class="text-center">
          <v-btn class="mx-auto" text @click="gameStart"
            >ゲームを開始する</v-btn
          >
          <v-card outlined class="mx-auto" max-width="200" max-height="200">
            <v-card-text>
              <p v-if="turn === 1">あなたの石はblackです</p>
              <p v-else>あなたの石はwhiteです</p>
            </v-card-text>
          </v-card>
          <v-card flat>
            <canvas id="canvas" width="500" height="500"></canvas>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
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
      count: 0,
      gameFlag: false
    }
  },
  mounted() {
    this.init()
    this.mainProcess()
    this.socket.on('connected', () => {
      console.log('接続が確認されました')
      this.socket.emit('joinRoom', this.$store.state.roomId)
      console.log('joinしました')
    })
    this.socket.on('getBord', (bord, turn) => {
      this.bord = bord
      this.turn = turn
      this.gameFlag = true
      this.pushStone()
      console.log('getしました')
    })
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

        // ゲームフラッグがfalseならreturn
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
        this.socket.emit('sendBord', this.bord, this.turn, this.gameFlag)
        this.gameFlag = false
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
    gameStart() {
      console.log((this.gameFlag = true))
    },
    roomingId() {
      // ルームIDの生成
      const length = 6
      const charset =
        'abcdefghijklmnopqrstuvwxyz' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        '0123456789'
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
  }
}
</script>
<style>
.square {
  width: 100px;
  height: 100px;
  background: black;
}
</style>
