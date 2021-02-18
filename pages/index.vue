<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col class="text-center">
          <h3>PC推奨</h3>
          <v-card class="mx-auto" max-width="400">
            <v-card-title>待機ルーム一覧</v-card-title>
          </v-card>
          <v-card class="mx-auto" max-width="400">
            <v-card-text>
              <v-btn @click="fetchRoomId">部屋を作る</v-btn>
            </v-card-text>
          </v-card>
          <v-row>
            <v-col v-for="(item, index) in dutyRoom" :key="item.idKey">
              <v-card
                class="mx-auto"
                width="300"
                height="100"
                @click="selectRoom(index)"
              >
                <v-card-text>
                  <p>{{ index + 1 }}ルーム</p>
                  <p>{{ item.number }}人</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
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
      socket: io(),
      dutyRoom: []
    }
  },
  mounted() {
    this.socket.on('connected', () => {})
    this.resDutyRoom()
    this.socket.emit('bordRequest')
    this.reqRoom()
  },
  methods: {
    fetchRoomId() {
      this.socket.emit('makeDutyId')
      this.reqRoom()
    },
    reqRoom() {
      this.socket.emit('bordRequest')
      this.socket.on('res', (f) => {
        this.dutyRoom = f
        this.roomNumberChange(f)
        this.dutyRoom.forEach((e) => (e.number == null ? (e.number = 0) : ''))
      })
    },
    roomNumberChange(f) {
      this.dutyRoom.forEach((e, i) => (e.number = f[i].number.length))
    },
    resDutyRoom() {
      this.socket.on('resDutyRoom', (resData) => (this.dutyRoom = resData))
    },
    selectRoom(i) {
      this.$store.commit('allocation', this.dutyRoom[i].id)
      this.$store.commit('numberManagement', this.dutyRoom[i].number)
      this.socket.emit('createBord', this.dutyRoom[i].id)
      this.$router.push('./room')
    }
  }
}
</script>
