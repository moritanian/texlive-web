<template>
  <li class="message-item" :class="{myMessage: isMine}">
    <img :src="userImageUrl"/>
    <div class="message-detail">
      <div class="user">{{userId}}</div>
      <div class="date">{{date}}</div>
      <div class="contents">{{contents}}</div>
    </div>
  </li>
</template>
<script>

export default {
  name: 'MessageItem',
  props: {
    'isMine': Boolean,
    'contents': String,
    'userId': String,
    'date': String,
    'userImageUrl': String
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
.message-item {
  margin: 8px;
  img {
    width: 30px;
    float: left;
  }

  .message-detail {
    float: left;
    margin-left: 8px;
    .user {
      text-align: left;
      margin-right: 10px;
      float: left;
      font-weight: bold;
    }
    .date {
      text-align: left;
      float: left;
      color: rgb(177, 177, 177);
      font-size: 11px;
    }
    .contents {
      text-align: left;
      clear: both;
      line-height: 14px;

    }
  }
}

.message-item.myMessage {
  .user {
  }

  .date {
  }
}
</style>
