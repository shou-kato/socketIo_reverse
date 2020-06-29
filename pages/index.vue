<template lang="pug">
  div
    h1 オンラインオセロゲーム
    button(@click='createRoom') オセロを始める
    button(@click='wait')
</template>

<script>
import io from 'socket.io-client'
export default {
  data() {
    return {
      socket: io()
    }
  },
  mounted() {
    this.socket.on('connected', () => {
      console.log('コネクトしました')
    })
  },
  methods: {
    createRoom() {
      this.$router.push('/room')
    },
    wait() {
      this.$router.push('/waiting-room')
    }
  }
}
</script>
