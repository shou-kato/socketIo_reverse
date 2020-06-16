<template lang="pug">
  div
    button(@click='createRoom') オセロを始める
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
    }
  }
}
</script>
