<template lang="pug">
div
    h1  待機ルーム一覧  
    p {{ this.$store.state.roomId}}
    button(@click="getRoomId") getId
    button(v-for="item in waitingRoom")
      p(@click="kenti(item)") ルーム
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
