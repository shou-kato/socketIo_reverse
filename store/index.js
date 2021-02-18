export const state = () => ({
  roomId: '',
  numberOfPeople: '',
})

export const mutations = {
  allocation(state, payload) {
    state.roomId = payload
  },
  numberManagement(state, payload) {
    state.numberOfPeople = payload
  },
}
