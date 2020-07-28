export const state = () => ({
  roomId: '',
  fa: ''
})

export const mutations = {
  allocation(state, payload) {
    state.roomId = payload
  },
  test(state, payload) {
    state.fa = payload
  }
}
