import { ref, reactive } from 'vue';

// 这是一个单例模式的Toast服务
class ToastService {
  constructor() {
    // 用于跟踪当前是否显示toast
    this.show = ref(false);
    // toast的消息内容
    this.message = ref('');
    // toast显示的持续时间
    this.duration = ref(3000);
    // 存储可能的多个toast的队列
    this.queue = reactive([]);
    // 当前是否正在显示toast
    this.isProcessing = false;
  }

  // 显示一个toast消息
  showToast(message, duration = 3000) {
    // 将新的toast加入队列
    this.queue.push({ message, duration });
    
    // 如果当前没有正在处理的toast，立即处理队列
    if (!this.isProcessing) {
      this._processQueue();
    }
  }

  // 处理队列中的toast
  _processQueue() {
    // 如果队列为空，结束处理
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    // 标记为正在处理
    this.isProcessing = true;
    
    // 获取队列中的第一个toast并显示
    const { message, duration } = this.queue.shift();
    this.message.value = message;
    this.duration.value = duration;
    this.show.value = true;

    // 设置定时器，在指定时间后隐藏toast并处理下一个
    setTimeout(() => {
      this.show.value = false;
      
      // 延迟一点时间再处理下一个，让当前toast完成消失动画
      setTimeout(() => {
        this._processQueue();
      }, 300);
    }, duration);
  }
}

// 创建单例实例
const toastService = new ToastService();

// 导出实例
export default toastService; 