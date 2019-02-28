<template>
  <div class="chat-panel">
    <message-list :messageList="messageList" :userId="userId" :users="users" class="message-list"></message-list>
    <div class="chat-form">
      <form @submit.prevent="submitMessage">
        <input type="text" v-model="contents">
      </form>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import MessageList from './MessageList.vue'
import { SUBMIT_MESSAGE_ACTION } from '../../store/modules/chat'

export default {
  name: 'ChatPanel',
  components: {MessageList},
  props: [],
  data () {
    return {
      contents: ''
    }
  },
  mounted () {
  },
  computed: mapState({
    messageList: state => state.chat.messageList,
    userId: state => state.chat.userId,
    users: state => state.chat.users
  }),
  methods: {
    submitMessage () {
      if (!this.contents) {
        return
      }
      this.$store.dispatch(SUBMIT_MESSAGE_ACTION, {contents: this.contents})
      this.contents = ''
    }
  }
}
</script>

<style scoped lang="scss">
.chat-panel {
  height: 100%;

  .message-list {
    height: calc(100% - 22px);
    overflow: scroll;
  }
  .chat-form {
    background-color: #e2e2e2;
  }
}
</style>
