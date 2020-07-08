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
              <v-card width="400" height="100"
                ><v-card-text
                  ><p @click="kenti(item)">
                    {{ index + 1 }}ルーム
                  </p></v-card-text
                ></v-card
              ></v-col
            >
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
      waitingRoom: []
    }
  },
  mounted() {
    this.socket.on('connected', () => {
      console.log('コネクトしました')
    })
    this.socket.on('hoge2', (test) => {
      this.waitingRoom = test
      console.log(test)
    })
  },
  methods: {
    getRoomId() {
      this.socket.emit('hoge')
      this.socket.on('hoge1', (id) => {
        this.waitingRoom = id
      })
    },
    kenti(item) {
      const index = this.waitingRoom.indexOf(item)
      alert(this.waitingRoom[index])
      this.$store.commit('allocation', this.waitingRoom[index])
      console.log(this.$store.state.roomId)
      this.$router.push('./room')
    }
  }
}
</script>
