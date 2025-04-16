<template>
  <div class="private-chat-container">
    <h1>实时聊天工具</h1>
    
    <div class="chat-navigation">
      <router-link to="/tools/chat/chat" class="nav-link">公共聊天</router-link>
      <router-link to="/tools/chat/private-chat" class="nav-link active">私人聊天</router-link>
    </div>
    
    <div class="chat-main">
      <div class="sidebar">
        <div class="user-info">
          <img :src="userAvatar" class="user-avatar" />
          <span class="username">{{ userName }}</span>
          <button v-if="!session" @click="signInWithGoogle" class="login-button">
            <GoogleIcon :size="14" />
            Google登录
          </button>
          <!-- <button v-if="!session" @click="changeAnonymousName" class="random-name-button">随机昵称</button> -->
          <button v-else @click="signOut" class="logout-button">退出</button>
        </div>
        
        <div class="chat-list">
          <h3>聊天列表</h3>
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="chatRooms.length === 0" class="empty-list">
            还没有聊天，创建一个吧！
          </div>
          <div 
            v-for="room in chatRooms" 
            :key="room.id" 
            :class="['chat-item', currentRoomId === room.id ? 'active' : '']"
            @click="selectRoom(room.id)"
          >
            <div class="chat-item-info">
              <span class="chat-name">{{ room.name }}</span>
              <span class="chat-last-message">{{ room.last_message || '无消息' }}</span>
            </div>
          </div>
        </div>
        
        <button @click="showCreateRoomModal = true" class="create-room-btn">创建新聊天</button>
      </div>
      
      <div class="chat-content">
        <template v-if="!currentRoomId">
          <div class="no-room-selected">
            <p>请选择一个聊天或创建新的聊天</p>
          </div>
        </template>
        <template v-else>
          <div class="room-header">
            <h3>{{ currentRoom?.name }}</h3>
            <button @click="showInviteModal = true" class="invite-btn">邀请</button>
          </div>
          
          <div class="messages" ref="messagesContainer">
            <div v-if="loadingMessages" class="loading">加载消息中...</div>
            <div v-else-if="messages.length === 0" class="empty-messages">
              <p>还没有消息，开始聊天吧！</p>
            </div>
            <div 
              v-for="message in messages" 
              :key="message.id" 
              :class="['message', isMyMessage(message) ? 'my-message' : 'other-message']"
            >
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
          </div>
          
          <div class="input-area">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              placeholder="输入消息..." 
              class="message-input" 
            />
            <button 
              @click="sendMessage" 
              class="send-button"
              :disabled="!newMessage.trim() || sending"
            >
              <span v-if="sending">发送中...</span>
              <span v-else>发送</span>
            </button>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 创建新聊天室模态框 -->
    <div v-if="showCreateRoomModal" class="modal">
      <div class="modal-content">
        <h3>创建新聊天</h3>
        <input v-model="newRoomName" placeholder="聊天名称" class="modal-input" />
        <div class="modal-actions">
          <button @click="showCreateRoomModal = false" class="cancel-btn">取消</button>
          <button @click="createRoom" :disabled="!newRoomName.trim()" class="confirm-btn">创建</button>
        </div>
      </div>
    </div>
    
    <!-- 邀请用户模态框 -->
    <div v-if="showInviteModal" class="modal">
      <div class="modal-content">
        <h3>邀请用户</h3>
        <input v-model="inviteEmail" placeholder="用户邮箱" class="modal-input" />
        <div class="modal-actions">
          <button @click="showInviteModal = false" class="cancel-btn">取消</button>
          <button @click="inviteUser" :disabled="!inviteEmail.trim()" class="confirm-btn">邀请</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue';
import { supabase } from '../../../utils/supabase';
import { useStore } from 'vuex';
import { GoogleIcon } from '../../../components/icons';

export default {
  name: 'PrivateChat',
  components: {
    GoogleIcon
  },
  setup() {
    // 用户状态
    const session = ref(null);
    const loading = ref(true);
    const loadingMessages = ref(false);
    const sending = ref(false);
    const store = useStore();
    
    // 获取Toast服务
    const toast = inject('toast');
    
    // 匿名用户信息
    const anonymousName = ref('游客' + Math.floor(Math.random() * 1000)); // 默认随机游客名
    const anonymousId = ref('anon_' + Date.now().toString()); // 为每个匿名会话生成一个唯一ID
    
    // 聊天室数据
    const chatRooms = ref([]);
    const currentRoomId = ref(null);
    const currentRoom = ref(null);
    const messages = ref([]);
    const newMessage = ref('');
    const messagesContainer = ref(null);
    
    // 订阅
    let subscription = null;
    let roomsSubscription = null;
    
    // 模态框状态
    const showCreateRoomModal = ref(false);
    const showInviteModal = ref(false);
    const newRoomName = ref('');
    const inviteEmail = ref('');
    
    // 生成随机匿名用户名
    const generateRandomName = () => {
      const prefixes = ['快乐', '开心', '阳光', '微笑', '活力', '机智', '聪明', '勇敢', '友善', '好奇'];
      const nouns = ['小猫', '小狗', '企鹅', '狮子', '老虎', '熊猫', '兔子', '松鼠', '鹦鹉', '海豚'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNum = Math.floor(Math.random() * 1000);
      return `${randomPrefix}${randomNoun}${randomNum}`;
    };

    // 更换匿名用户名称
    const changeAnonymousName = () => {
      anonymousName.value = generateRandomName();
      // 使用toast显示提示信息
      toast.show(`你的昵称已更改为: ${anonymousName.value}`);
    };
    
    // 获取当前会话
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      session.value = data.session;
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
    
    // 获取聊天室列表
    const fetchChatRooms = async () => {
      if (!session.value) return;
      
      loading.value = true;
      try {
        // 先获取用户所在的聊天室成员关系
        const { data: memberships, error: membershipError } = await supabase
          .from('chat_room_members')
          .select('room_id, role')
          .eq('user_id', session.value.user.id);
          
        if (membershipError) throw membershipError;
        
        if (!memberships || memberships.length === 0) {
          chatRooms.value = [];
          loading.value = false;
          return;
        }
        
        // 获取聊天室详情
        const roomIds = memberships.map(m => m.room_id);
        const { data: rooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select('*')
          .in('id', roomIds);
          
        if (roomsError) throw roomsError;
        
        // 合并角色信息
        const roomsWithRole = rooms.map(room => {
          const membership = memberships.find(m => m.room_id === room.id);
          return {
            ...room,
            role: membership ? membership.role : 'member'
          };
        });
        
        // 按更新时间排序
        roomsWithRole.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        // 获取每个聊天室的最后一条消息
        const roomsWithMessages = [...roomsWithRole];
        for (const room of roomsWithMessages) {
          try {
            const { data: messages } = await supabase
              .from('private_messages')
              .select('content, created_at')
              .eq('room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (messages && messages.length > 0) {
              room.last_message = messages[0].content;
              room.last_message_time = messages[0].created_at;
            }
          } catch (err) {
            console.error(`获取聊天室 ${room.id} 的最后一条消息失败:`, err);
          }
        }
        
        chatRooms.value = roomsWithMessages;
        
        // 如果当前选中的聊天室不在列表中，清除选择
        if (currentRoomId.value && !roomsWithMessages.some(room => room.id === currentRoomId.value)) {
          currentRoomId.value = null;
          currentRoom.value = null;
          messages.value = [];
        }
      } catch (err) {
        console.error('获取聊天室失败:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 选择聊天室
    const selectRoom = (roomId) => {
      currentRoomId.value = roomId;
      currentRoom.value = chatRooms.value.find(room => room.id === roomId);
      fetchMessages();
    };
    
    // 获取消息
    const fetchMessages = async () => {
      if (!currentRoomId.value) return;
      
      loadingMessages.value = true;
      try {
        const { data, error } = await supabase
          .from('private_messages')
          .select('*')
          .eq('room_id', currentRoomId.value)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        messages.value = data;
      } catch (err) {
        console.error('获取消息失败:', err);
      } finally {
        loadingMessages.value = false;
        scrollToBottom();
      }
    };
    
    // 创建聊天室
    const createRoom = async () => {
      if (!session.value || !newRoomName.value.trim()) return;
      
      try {
        // 插入新聊天室
        const { data: roomData, error: roomError } = await supabase
          .from('chat_rooms')
          .insert([
            { 
              name: newRoomName.value.trim(),
              created_by: session.value.user.id
            }
          ])
          .select();
        
        if (roomError) throw roomError;
        
        const newRoomId = roomData[0].id;
        
        // 添加创建者为成员
        const { error: memberError } = await supabase
          .from('chat_room_members')
          .insert([
            { 
              room_id: newRoomId,
              user_id: session.value.user.id,
              role: 'owner'
            }
          ]);
        
        if (memberError) throw memberError;
        
        // 刷新聊天室列表
        fetchChatRooms();
        
        // 清空并关闭模态框
        newRoomName.value = '';
        showCreateRoomModal.value = false;
        
        // 选择新创建的聊天室
        selectRoom(newRoomId);
      } catch (err) {
        console.error('创建聊天室失败:', err);
        toast.show('创建聊天室失败，请重试');
      }
    };
    
    // 邀请用户
    const inviteUser = async () => {
      if (!session.value || !currentRoomId.value || !inviteEmail.value.trim()) return;
      
      try {
        // 查找用户是否存在
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', inviteEmail.value.trim());
        
        if (userError) throw userError;
        
        if (!users || users.length === 0) {
          toast.show('找不到该用户，请确认邮箱地址');
          return;
        }
        
        const userId = users[0].id;
        
        // 直接添加用户到聊天室，如果已存在会因为唯一约束失败
        const { error: addMemberError } = await supabase
          .from('chat_room_members')
          .insert([{ 
            room_id: currentRoomId.value,
            user_id: userId,
            role: 'member'
          }]);
        
        if (addMemberError) {
          // 如果是唯一约束错误，说明用户已在聊天室中
          if (addMemberError.code === '23505') {
            toast.show('该用户已在聊天室中');
            return;
          }
          throw addMemberError;
        }
        
        // 清空并关闭模态框
        inviteEmail.value = '';
        showInviteModal.value = false;
        
        toast.show('邀请成功');
      } catch (err) {
        console.error('邀请用户失败:', err);
        toast.show('邀请用户失败，请重试');
      }
    };
    
    // 发送消息
    const sendMessage = async () => {
      if (!session.value || !currentRoomId.value || !newMessage.value.trim() || sending.value) return;
      
      const messageContent = newMessage.value.trim();
      newMessage.value = '';
      sending.value = true;
      
      try {
        const { error } = await supabase
          .from('private_messages')
          .insert([
            { 
              room_id: currentRoomId.value,
              user_id: session.value.user.id,
              content: messageContent,
              username: userName.value,
              avatar_url: userAvatar.value
            }
          ]);
        
        if (error) throw error;
        
        // 更新聊天室最后活动时间
        await supabase
          .from('chat_rooms')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentRoomId.value);
      } catch (err) {
        console.error('发送消息失败:', err);
        toast.show('发送消息失败，请重试');
        newMessage.value = messageContent;
      } finally {
        sending.value = false;
      }
    };
    
    // 判断是否是自己的消息
    const isMyMessage = (message) => {
      return session.value && message.user_id === session.value.user.id;
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
    
    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };
    
    // 使用Google登录
    const signInWithGoogle = async () => {
      // 保存当前路径作为登录成功后的重定向路径
      store.dispatch('saveAuthSource', '/tools/chat/private-chat');
      
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('登录失败:', error);
        toast.show('登录失败，请重试');
      }
    };
    
    // 退出登录
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('退出登录失败:', error);
        toast.show('退出登录失败，请重试');
        return;
      }
      
      session.value = null;
      chatRooms.value = [];
      currentRoomId.value = null;
      currentRoom.value = null;
      messages.value = [];
    };
    
    // 订阅实时消息功能
    const subscribeToMessages = () => {
      if (!currentRoomId.value || !session.value) return;
      
      // 先取消之前的订阅
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      
      subscription = supabase
        .channel(`private-room-${currentRoomId.value}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'private_messages',
            filter: `room_id=eq.${currentRoomId.value}`
          }, 
          (payload) => {
            messages.value.push(payload.new);
            // 当收到新消息时滚动到底部
            nextTick(scrollToBottom);
          }
        )
        .subscribe((status) => {
          console.log(`实时消息订阅状态 (房间 ${currentRoomId.value}):`, status);
        });
    };

    // 订阅聊天室列表更新
    const subscribeToRooms = () => {
      if (!session.value) return;
      
      roomsSubscription = supabase
        .channel('private-rooms-changes')
        .on('postgres_changes', 
          {
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_rooms'
          }, 
          () => {
            // 重新获取聊天室列表
            fetchChatRooms();
          }
        )
        .on('postgres_changes', 
          {
            event: 'UPDATE', 
            schema: 'public', 
            table: 'chat_rooms'
          }, 
          () => {
            // 重新获取聊天室列表
            fetchChatRooms();
          }
        )
        .on('postgres_changes', 
          {
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_room_members',
            filter: `user_id=eq.${session.value.user.id}`
          }, 
          () => {
            // 重新获取聊天室列表
            fetchChatRooms();
          }
        )
        .on('postgres_changes', 
          {
            event: 'DELETE', 
            schema: 'public', 
            table: 'chat_room_members',
            filter: `user_id=eq.${session.value.user.id}`
          }, 
          () => {
            // 重新获取聊天室列表
            fetchChatRooms();
          }
        )
        .subscribe((status) => {
          console.log('聊天室订阅状态:', status);
        });
    };

    // 选择聊天室时订阅消息
    watch(currentRoomId, (newRoomId) => {
      if (newRoomId) {
        subscribeToMessages();
      } else if (subscription) {
        supabase.removeChannel(subscription);
        subscription = null;
      }
    });

    onMounted(async () => {
      await getSession();
      if (session.value) {
        await fetchChatRooms();
        subscribeToRooms();
      }
      
      // 只有未登录时才从本地存储恢复匿名用户信息
      if (!session.value) {
        const savedName = localStorage.getItem('anonymousName');
        const savedId = localStorage.getItem('anonymousId');
        if (savedName) {
          anonymousName.value = savedName;
        } else {
          // 没有保存的名称，生成一个更友好的随机名称
          anonymousName.value = generateRandomName();
        }
        if (savedId) {
          anonymousId.value = savedId;
        } else {
          // 保存新生成的匿名ID
          localStorage.setItem('anonymousId', anonymousId.value);
        }
      }
      
      // 订阅身份验证变化
      supabase.auth.onAuthStateChange((_event, updatedSession) => {
        session.value = updatedSession;
        if (updatedSession) {
          fetchChatRooms();
          subscribeToRooms();
        } else {
          chatRooms.value = [];
          currentRoomId.value = null;
          currentRoom.value = null;
          messages.value = [];
          
          // 取消所有订阅
          if (subscription) {
            supabase.removeChannel(subscription);
            subscription = null;
          }
          if (roomsSubscription) {
            supabase.removeChannel(roomsSubscription);
            roomsSubscription = null;
          }
        }
      });
    });

    // 当匿名名称改变时，只有在未登录状态下才保存到本地存储
    watch(anonymousName, (newVal) => {
      if (!session.value) {
        localStorage.setItem('anonymousName', newVal);
      }
    });

    onUnmounted(() => {
      // 取消所有订阅
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (roomsSubscription) {
        supabase.removeChannel(roomsSubscription);
      }
    });
    
    return {
      session,
      loading,
      loadingMessages,
      sending,
      chatRooms,
      currentRoomId,
      currentRoom,
      messages,
      newMessage,
      showCreateRoomModal,
      showInviteModal,
      newRoomName,
      inviteEmail,
      userAvatar,
      userName,
      messagesContainer,
      formatTime,
      isMyMessage,
      selectRoom,
      fetchMessages,
      createRoom,
      inviteUser,
      sendMessage,
      signInWithGoogle,
      signOut,
      anonymousName,
      anonymousId,
      changeAnonymousName
    };
  }
}
</script>

<style scoped>
.private-chat-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

.chat-navigation {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #f0f0f0;
}

.nav-link.active {
  background-color: #e3f2fd;
  color: #4285f4;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.chat-main {
  display: flex;
  height: 75vh;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eaeaea;
  background-color: #f8f9fa;
}

.user-info {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #eaeaea;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 500;
  flex: 1;
}

.login-button, .logout-button, .random-name-button {
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  border: none;
}

.login-button {
  background-color: #4285f4;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px 5px 10px;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
}

.login-button:hover {
  background-color: #3367d6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
}

.random-name-button {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  box-shadow: 0 2px 5px rgba(255, 152, 0, 0.3);
}

.random-name-button:hover {
  background-color: #f57c00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.4);
}

.logout-button {
  background-color: #f5f5f5;
  color: #e53935;
  border: 1px solid #e53935;
}

.logout-button:hover {
  background-color: #e53935;
  color: white;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.chat-list h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #555;
}

.chat-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f0f0f0;
}

.chat-item.active {
  background-color: #e3f2fd;
}

.chat-name {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
}

.chat-last-message {
  display: block;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.create-room-btn {
  margin: 15px;
  padding: 10px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.create-room-btn:hover {
  background-color: #3367d6;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.room-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
}

.room-header h3 {
  margin: 0;
  font-size: 18px;
}

.invite-btn {
  padding: 5px 12px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  max-width: 70%;
  gap: 12px;
}

.my-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.other-message {
  align-self: flex-start;
}

.message-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.message-content {
  background-color: white;
  padding: 10px 15px;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.my-message .message-content {
  background-color: #e3f2fd;
  border-top-right-radius: 4px;
}

.other-message .message-content {
  background-color: white;
  border-top-left-radius: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.message-author {
  font-weight: 600;
}

.message-time {
  font-size: 10px;
  color: #999;
}

.no-room-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-style: italic;
}

.input-area {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #eaeaea;
}

.message-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.send-button {
  padding: 0 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.modal-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.confirm-btn {
  background-color: #4285f4;
  color: white;
  border: none;
}

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading, .empty-list, .empty-messages {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style> 