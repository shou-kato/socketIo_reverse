<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col class="text-center">
          <v-card class="mx-auto" max-width="400">
            <v-card-title>待機ルーム一覧</v-card-title>
          </v-card>
          <v-card class="mx-auto" max-width="400">
            <v-card-text>
              <v-btn @click="getRoomId">部屋を作る</v-btn>
            </v-card-text>
          </v-card>
          <v-row>
            <v-col v-for="(item, index) in waitingRoom" :key="index">
              <v-card width="400" height="100">
                <v-card-text>
                  <p @click="selectRoom(item)">{{ index + 1 }}ルーム</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-card v-for="(items, j) in roomNumber" :key="j">
        <v-card-text>{{ items }}</v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>
<script>
import io from 'socket.io-client'
export default {
  data() {
    return {
      socket: io(),
      waitingRoom: [],
      roomNumber: []
    }
  },
  mounted() {
    this.socket.on('connected', () => {})
    this.socket.on('getWaitingRoom', (waitingRoom) => {
      this.waitingRoom = waitingRoom
    })
    this.socket.emit('reqRoomNumber')
    this.socket.on('sendRoomNumber', (sNumber) => {
      this.roomNumber = sNumber.map((s) => s.length)
    })
  },
  methods: {
    getRoomId() {
      this.socket.emit('createWaitingId')
      this.socket.on('getWaitingId', (id) => {
        this.waitingRoom = id
      })
    },
    selectRoom(item) {
      const index = this.waitingRoom.indexOf(item)
      alert(typeof index)
      // this.socket.emit('selectJoinRoom', this.waitingRoom[index])
      this.$store.commit('allocation', this.waitingRoom[index])
      this.$router.push('./room')
    }
  }
}
</script>
