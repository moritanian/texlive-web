import {shareState} from '@/libs/vue-Multiplayer/index'
export const SUBMIT_MESSAGE_ACTION = 'SUBMIT_MESSAGE_ACTION'

const ADD_MESSAGE_MUTATION = 'ADD_MESSAGE_MUTATION'

var state = {
  messageList: [],
  userId: '1234',
  roomId: 'hogehogeroom1234',
  users: {}
}

state.users[state.userId] = {
  'name': 'Lucy',
  'imageUrl': require('./../../assets/chat-icon.svg')
}

shareState('chat', {
  message: state.messageList
}, state.roomId, state.userId)

const mutations = {
  [ADD_MESSAGE_MUTATION] (state, message) {
    state.messageList.splice(state.messageList.length, 0, message)
  }
}

const actions = {
  [SUBMIT_MESSAGE_ACTION] ({commit, state}, {contents}) {
    commit(ADD_MESSAGE_MUTATION, {
      userId: state.userId,
      contents: contents,
      date: (new Date()).toLocaleDateString()
    })
  }
}

export default {
  state,
  mutations,
  actions,
}
