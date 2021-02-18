<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col class="text-center">
          <v-btn @click="gameStart"
            >ここのボタンを押して準備完了にしてください
          </v-btn>
          <div>
            <v-row>
              <v-col class="text-right">
                <p v-if="!isReady">準備中</p>
                <p v-else>準備完了</p>
                <p>{{ moveOrder }}</p>
                <p v-if="moveOrder === '先行'">あなたの石は黒です</p>
                <p v-if="moveOrder === '後攻'">あなたの石は白です</p>
                <p v-if="gameFlag">あなたの番です</p>
              </v-col>
            </v-row>
            <div
              style="margin: auto;width: 400px;height: 400px; background: green;"
            >
              <canvas
                id="canvas"
                style="margin-left: -50px; margin-top: -50px;"
                width="500"
                height="500"
              ></canvas>
            </div>
          </div>
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
      reverseBord: [
        [3, 3, 3, 3, 3, 3, 3, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 0, 0, 0, -1, 1, 0, 0, 0, 3],
        [3, 0, 0, 0, 1, -1, 0, 0, 0, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
        [3, 3, 3, 3, 3, 3, 3, 3]
      ],
      turn: 1,
      socket: io(),
      count: 0,
      gameFlag: false,
      isReady: false,
      moveOrder: null
    }
  },
  mounted() {
    this.generateStage()
    this.pushStone()

    this.mainProcess()
    this.socket.on('connected', () =>
      this.socket.emit('joinRoom', this.$store.state.roomId)
    )

    this.socket.on('getBord', (reverseBord, flag) => {
      this.reverseBord = reverseBord
      this.gameFlag = flag
      this.pushStone()
    })

    this.socket.on('send', (i) => {
      this.moveOrder = i[this.$store.state.numberOfPeople]
      if (this.moveOrder === '先行') this.gameFlag = true
    })
    this.socket.on('flagCheck', () => this.socket.emit('isReady', this.isReady))
  },
  methods: {
    generateStage() {
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
      const fillStone = (y, x) => {
        if (this.reverseBord[y][x] === 0) return 'rgba(0,0,0,0)'
        if (this.reverseBord[y][x] === -1) return 'rgb(255, 255, 255)'
        if (this.reverseBord[y][x] === 1) return 'rgb(0,0,0)'
        if (this.reverseBord[y][x] === 3) return 'rgba(0,0,0,0)'
      }
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          ctx.beginPath()
          ctx.arc(50 * x + 25, 50 * y + 25, 20, 0, 2 * Math.PI, false)
          ctx.fillStyle = fillStone(y, x)
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

        if (!this.gameFlag) return

        // 石の重ね置き防止。
        if (this.reverseBord[yCoordinate][xCoordinate] === 1) return
        if (this.reverseBord[yCoordinate][xCoordinate] === -1) return

        if (this.moveOrder === '先行') this.turn = 1
        if (this.moveOrder === '後攻') this.turn = -1

        this.invertStone(yCoordinate, xCoordinate, 1, 0, this.turn)
        this.invertStone(yCoordinate, xCoordinate, -1, 0, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 0, 1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 0, -1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, -1, -1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, 1, -1, this.turn)
        this.invertStone(yCoordinate, xCoordinate, -1, 1, this.turn)

        if (this.count === 0)
          return (this.reverseBord[yCoordinate][xCoordinate] = 0)

        // 石をひっくり返せた場合
        if (this.count !== 0) this.count = 0

        this.pushStone()
        this.socket.emit('sendBord', this.reverseBord, this.gameFlag)
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
      const transparent = 0

      if (this.reverseBord[y + dy][x + dx] === c) {
        this.reverseBord[y][x] = c
        return c
      }

      if (this.reverseBord[y + dy][x + dx] === -c) {
        if (this.invertStone(y + dy, x + dx, dy, dx, c) === transparent) {
          return transparent
        }

        this.reverseBord[y][x] = c
        this.count += 1

        return this.invertStone(y + dy, x + dx, dy, dx, c)
      }

      return transparent
    },
    gameStart() {
      if (this.isReady) return
      this.socket.emit('gameStart', this.$store.state.roomId)
      this.isReady = true
    }
  }
}
</script>
