export const state = () => ({
  roomId: ''
})

export const mutations = {
  allocation(state, payload) {
    state.roomId = payload
  }
}
