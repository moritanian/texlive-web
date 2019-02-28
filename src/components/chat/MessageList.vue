<template>
  <ul class="message-list">
    <message-item v-for="(message, index) in messageList"
      v-bind:key="index"
      :contents="message.contents"
      :date="message.date"
      :userId="message.userId"
      :isMine="message.userId===userId"
      :userImageUrl="users[userId].imageUrl"
      ></message-item>
  </ul>
</template>
<script>
import MessageItem from './MessageItem.vue'

export default {
  name: 'MessageList',
  components: {MessageItem},
  props: {
    'messageList': Array,
    'userId': String,
    'users': Object
  },
  mounted () {
  }
}
</script>

<style scoped>
ul {
  list-style-type: none;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
