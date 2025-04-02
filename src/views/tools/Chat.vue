<template>
  <div class="chat-container">
    <h1>实时聊天工具</h1>
    
    <div class="chat-main">
      <div class="header">
        <div class="user-info">
          <img :src="userAvatar" class="avatar" />
          <span>{{ userName }}</span>
          <button v-if="!session" @click="signInWithGoogle" class="login-button-small">使用Google登录</button>
        </div>
        <button v-if="session" @click="signOut" class="logout-button">退出登录</button>
      </div>
      
      <div class="messages" ref="messagesContainer">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="messages.length === 0" class="empty-messages">
          <p>还没有消息，开始聊天吧！</p>
        </div>
        <div v-for="message in messages" :key="message.id" :class="['message', isMyMessage(message) ? 'my-message' : 'other-message']">
          <div class="message-avatar">
            <img :src="message.avatar_url" alt="avatar" />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-author">{{ message.username }}</span>
              <span class="message-time">{{ formatTime(message.created_at) }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
        <div ref="messagesEnd" class="messages-end"></div>
      </div>
      
      <div class="input-area">
        <input 
          v-if="!showNameInput"
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          ref="messageInput"
          placeholder="输入消息..." 
          class="message-input" 
        />
        <input 
          v-else
          v-model="inputAnonymousName" 
          @keyup.enter="setAnonymousName"
          ref="nameInput"
          placeholder="请先输入您的昵称..." 
          class="message-input" 
          autofocus
        />
        <button 
          v-if="!showNameInput" 
          @click="sendMessage" 
          class="send-button"
          :disabled="!newMessage.trim() || sending"
        >
          <span v-if="sending">发送中...</span>
          <span v-else>发送</span>
        </button>
        <button v-else @click="setAnonymousName" class="send-button">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { supabase } from '../../utils/supabase';

export default {
  name: 'ChatTool',
  setup() {
    const session = ref(null);
    const messages = ref([]);
    const newMessage = ref('');
    const messagesContainer = ref(null);
    const messagesEnd = ref(null);
    const loading = ref(true);
    const sending = ref(false);
    const messageInput = ref(null);
    const nameInput = ref(null);
    const anonymousName = ref('游客' + Math.floor(Math.random() * 1000)); // 默认随机游客名
    const inputAnonymousName = ref('');
    const anonymousId = ref('anon_' + Date.now().toString()); // 为每个匿名会话生成一个唯一ID
    const showNameInput = ref(false); // 默认不显示昵称输入
    let subscription = null;

    // 获取当前会话
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('getSession',data);
      session.value = data.session;
    };

    // 设置匿名用户名
    const setAnonymousName = () => {
      if (inputAnonymousName.value.trim()) {
        anonymousName.value = inputAnonymousName.value.trim();
      }
      showNameInput.value = false;
      
      // 使用 nextTick 确保在 DOM 更新后再设置焦点
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus();
        }
      });
    };

    // 计算用户头像
    const userAvatar = computed(() => {
      if (session.value) {
        return session.value.user.user_metadata.avatar_url || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(session.value.user.user_metadata.full_name)}&background=random`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(anonymousName.value)}&background=random`;
    });

    // 计算用户名
    const userName = computed(() => {
      if (session.value) {
        return session.value.user.user_metadata.full_name || session.value.user.email;
      }
      return anonymousName.value;
    });

    // 判断是否是自己的消息
    const isMyMessage = (message) => {
      if (session.value && message.user_id) {
        return message.user_id === session.value.user.id;
      }
      if (!session.value && message.anonymous_id) {
        return message.anonymous_id === anonymousId.value;
      }
      return false;
    };

    // 获取消息
    const fetchMessages = async () => {
      loading.value = true;
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('获取消息失败:', error);
          return;
        }
        
        messages.value = data;
      } catch (err) {
        console.error('获取消息出错:', err);
      } finally {
        loading.value = false;
        scrollToBottom();
      }
    };

    // 发送消息
    const sendMessage = async () => {
      if (!newMessage.value.trim() || sending.value) return;
      
      // 如果是匿名用户且未设置过昵称，提示设置昵称
      if (!session.value && anonymousName.value.startsWith('游客')) {
        showNameInput.value = true;
        nextTick(() => {
          if (nameInput.value) {
            nameInput.value.focus();
          }
        });
        return;
      }
      
      const messageContent = newMessage.value.trim();
      newMessage.value = ''; // 立即清空输入框，提升体验
      sending.value = true;
      
      const messageData = {
        content: messageContent,
      };
      
      if (session.value) {
        // 已登录用户
        messageData.user_id = session.value.user.id;
        messageData.username = session.value.user.user_metadata.full_name || session.value.user.email;
        messageData.avatar_url = session.value.user.user_metadata.avatar_url || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(messageData.username)}&background=random`;
      } else {
        // 匿名用户
        messageData.username = anonymousName.value;
        messageData.anonymous_id = anonymousId.value;
        messageData.avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(anonymousName.value)}&background=random`;
      }
      
      try {
        const { error } = await supabase
          .from('messages')
          .insert([messageData]);
        
        if (error) {
          console.error('发送消息失败:', error);
          alert('发送消息失败，请重试');
          newMessage.value = messageContent; // 恢复消息内容
          return;
        }
        
        // 发送成功后重新聚焦到输入框
        nextTick(() => {
          if (messageInput.value) {
            messageInput.value.focus();
          }
        });
      } catch (err) {
        console.error('发送消息出错:', err);
        alert('发送消息失败，请重试');
        newMessage.value = messageContent; // 恢复消息内容
      } finally {
        sending.value = false;
      }
    };

    // 使用Google登录
    const signInWithGoogle = async () => {
      // 使用回调URL进行OAuth认证
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/auth/callback`;
      console.log('登录重定向URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('登录失败:', error);
        alert('登录失败，请重试');
      }
    };

    // 退出登录
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('退出登录失败:', error);
        alert('退出登录失败，请重试');
        return;
      }
      
      console.log('成功退出登录');
      // 清除会话
      session.value = null;
      // 刷新页面确保状态完全重置
      window.location.reload();
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // 如果是今天的消息，只显示时间
      if (diff < 24 * 60 * 60 * 1000 && 
          date.getDate() === now.getDate() && 
          date.getMonth() === now.getMonth() && 
          date.getFullYear() === now.getFullYear()) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 如果是昨天的消息，显示"昨天 HH:MM"
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.getDate() === yesterday.getDate() && 
          date.getMonth() === yesterday.getMonth() && 
          date.getFullYear() === yesterday.getFullYear()) {
        return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 其他情况显示完整日期
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // 订阅实时消息
    const subscribeToMessages = () => {
      subscription = supabase
        .channel('messages-channel')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages' 
          }, 
          (payload) => {
            messages.value.push(payload.new);
            // 当收到新消息时滚动到底部
            nextTick(scrollToBottom);
          }
        )
        .subscribe((status) => {
          console.log('实时消息订阅状态:', status);
        });
    };

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesEnd.value) {
          messagesEnd.value.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        } else if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    // 监听消息变化，自动滚动到底部
    watch(messages, () => {
      scrollToBottom();
    });

    onMounted(async () => {
      await getSession();
      await fetchMessages();
      subscribeToMessages();
      
      // 设置输入框焦点
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus();
        }
      });

      // 只有未登录时才从本地存储恢复匿名用户信息
      if (!session.value) {
        const savedName = localStorage.getItem('anonymousName');
        const savedId = localStorage.getItem('anonymousId');
        if (savedName) {
          anonymousName.value = savedName;
        }
        if (savedId) {
          anonymousId.value = savedId;
        } else {
          // 保存新生成的匿名ID
          localStorage.setItem('anonymousId', anonymousId.value);
        }
      }

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((_event, updatedSession) => {
        console.log('认证状态变化:', _event, updatedSession ? '已登录' : '未登录');
        session.value = updatedSession;
      });
      
      // 添加页面可见性变化监听器，当用户返回页面时刷新消息
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // 监听窗口大小变化，保持滚动到底部
      window.addEventListener('resize', scrollToBottom);
    });

    // 当页面从隐藏变为可见时刷新消息
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages();
      }
    };

    // 当匿名名称改变时，只有在未登录状态下才保存到本地存储
    watch(anonymousName, (newVal) => {
      if (!session.value) {
        localStorage.setItem('anonymousName', newVal);
      }
    });

    // 监听会话变化
    watch(session, (newSession) => {
      console.log('会话状态变化:', newSession ? '已登录' : '未登录');
    });

    onUnmounted(() => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', scrollToBottom);
    });

    return {
      session,
      messages,
      newMessage,
      messagesContainer,
      messagesEnd,
      anonymousName,
      inputAnonymousName,
      userAvatar,
      userName,
      signInWithGoogle,
      signOut,
      sendMessage,
      formatTime,
      setAnonymousName,
      isMyMessage,
      showNameInput,
      loading,
      sending,
      messageInput,
      nameInput
    };
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.login-button-small {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

.login-button-small:hover {
  background-color: #3367d6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: 75vh;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
}

.user-info span {
  font-weight: 500;
  color: #2c3e50;
}

.logout-button {
  background-color: #f5f5f5;
  color: #e53935;
  border: 1px solid #e53935;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
}

.logout-button:hover {
  background-color: #e53935;
  color: white;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scroll-behavior: smooth;
  position: relative;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  gap: 10px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-style: italic;
}

.message {
  display: flex;
  max-width: 70%;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.my-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.other-message {
  align-self: flex-start;
}

.message-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
}

.message-content {
  background-color: white;
  padding: 12px 18px;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: relative;
}

.my-message .message-content {
  background-color: #e3f2fd;
  border-bottom-right-radius: 4px;
}

.other-message .message-content {
  background-color: white;
  border-bottom-left-radius: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #777;
}

.message-author {
  font-weight: 600;
  color: #333;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
}

.message-text {
  word-break: break-word;
  line-height: 1.4;
}

.input-area {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #eaeaea;
}

.message-input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  margin-right: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 1px 3px rgba(66, 133, 244, 0.2);
}

.send-button {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 0 22px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  background-color: #3367d6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .chat-main {
    height: 80vh;
  }
  
  .message {
    max-width: 85%;
  }
}

.messages-end {
  height: 1px;
  margin-bottom: 0;
  opacity: 0;
}
</style> 