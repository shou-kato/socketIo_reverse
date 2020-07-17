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
              <v-btn @click="fetchRoomId">部屋を作る</v-btn>
            </v-card-text>
          </v-card>
          <v-row>
            <v-col v-for="(item, index) in dutyRoom" :key="item.idKey">
              <v-card width="400" height="100">
                <v-card-text>
                  <p @click="selectRoom(index)">{{ index + 1 }}ルーム</p>
                  <p v-if="item.number === undefined || item.number === null">
                    0人
                  </p>
                  <p v-else>{{ item.number }}人</p>
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
  created() {},
  mounted() {
    this.socket.on('connected', () => {})
    this.resDutyRoom()
    this.socket.emit('req')
    this.socket.on('res', (f) => {
      this.dutyRoom = f
      this.roomNumberChange(f)
    })
  },
  methods: {
    fetchRoomId() {
      this.socket.emit('makeDutyId')
      this.socket.emit('test')
      this.socket.on('test1', (a) => {
        this.dutyRoom = a
        this.roomNumberChange(a)
      })
    },
    roomNumberChange(f) {
      for (let i = 0; i < this.dutyRoom.length; i++) {
        this.dutyRoom[i].number = f[i].number.length
      }
    },
    resDutyRoom() {
      this.socket.on('resDutyRoom', (resData) => (this.dutyRoom = resData))
    },
    selectRoom(i) {
      console.log(i)
      this.$store.commit('allocation', this.dutyRoom[i].id)
      this.$router.push('./room')
    }
  }
}
</script>
