<template>
  <div class="json-formatter">
    <h2><span class="tool-icon">{ }</span> JSON格式化工具</h2>
    <div class="formatter-container">
      <div class="form-group">
        <label for="input-json">输入JSON：</label>
        <textarea 
          id="input-json" 
          v-model="inputJson" 
          class="input-area" 
          placeholder="请输入需要格式化的JSON数据"
        ></textarea>
      </div>
      
      <div class="actions">
        <button class="format-btn" @click="formatJson('format')">
          <span class="btn-icon">✨</span>格式化
        </button>
        <button class="minify-btn" @click="formatJson('minify')">
          <span class="btn-icon">📦</span>压缩
        </button>
        <button class="validate-btn" @click="validateJson">
          <span class="btn-icon">✓</span>验证
        </button>
        <button class="clear-btn" @click="clearJson">
          <span class="btn-icon">🗑️</span>清空
        </button>
      </div>
      
      <div class="form-group result-container" v-if="formattedResult">
        <div class="result-header">
          <label for="output-json">结果：</label>
          <div class="copy-actions">
            <button class="copy-btn" @click="copyResult">
              <span class="btn-icon">📋</span>复制结果
            </button>
          </div>
        </div>
        <pre id="output-json" class="output-area">{{ formattedResult }}</pre>
      </div>
      
      <div class="status-message" v-if="statusMessage" :class="{ 'status-error': isError, 'status-success': !isError }">
        <span class="status-icon">{{ isError ? '❌' : '✅' }}</span>
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'JsonFormatter',
  setup() {
    const inputJson = ref('');
    const formattedResult = ref('');
    const statusMessage = ref('');
    const isError = ref(false);
    
    const formatJson = (type) => {
      if (!inputJson.value.trim()) {
        setStatus('请输入JSON数据', true);
        return;
      }
      
      try {
        const jsonObj = JSON.parse(inputJson.value);
        
        if (type === 'format') {
          formattedResult.value = JSON.stringify(jsonObj, null, 2);
          setStatus('格式化成功', false);
        } else if (type === 'minify') {
          formattedResult.value = JSON.stringify(jsonObj);
          setStatus('压缩成功', false);
        }
      } catch (error) {
        console.error('格式化出错:', error);
        setStatus(`JSON解析错误: ${error.message}`, true);
        formattedResult.value = '';
      }
    };
    
    const validateJson = () => {
      if (!inputJson.value.trim()) {
        setStatus('请输入JSON数据', true);
        return;
      }
      
      try {
        JSON.parse(inputJson.value);
        setStatus('验证成功：JSON格式有效', false);
      } catch (error) {
        setStatus(`验证失败：${error.message}`, true);
      }
    };
    
    const clearJson = () => {
      inputJson.value = '';
      formattedResult.value = '';
      statusMessage.value = '';
    };
    
    const copyResult = () => {
      if (!formattedResult.value) return;
      
      navigator.clipboard.writeText(formattedResult.value)
        .then(() => {
          setStatus('已复制到剪贴板', false);
        })
        .catch(err => {
          console.error('复制失败:', err);
          setStatus('复制失败', true);
        });
    };
    
    const setStatus = (message, error) => {
      statusMessage.value = message;
      isError.value = error;
      
      setTimeout(() => {
        if (statusMessage.value === message) {
          statusMessage.value = '';
        }
      }, 3000);
    };
    
    return {
      inputJson,
      formattedResult,
      statusMessage,
      isError,
      formatJson,
      validateJson,
      clearJson,
      copyResult
    };
  }
}
</script>

<style scoped>
.json-formatter {
  padding: 20px 0;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #623b5a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.8rem;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.tool-icon {
  margin-right: 12px;
  font-size: 1.8rem;
}

.formatter-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(161, 140, 209, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
}

.form-group {
  margin-bottom: 25px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.copy-actions {
  display: flex;
  align-items: center;
  position: relative;
}

label {
  display: block;
  font-weight: 600;
  color: #623b5a;
  font-size: 1.05rem;
}

.input-area {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  border: 1px solid rgba(161, 140, 209, 0.2);
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02) inset;
}

.input-area:focus {
  outline: none;
  border-color: #fbc2eb;
  box-shadow: 0 0 0 3px rgba(251, 194, 235, 0.25);
}

.output-area {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  background-color: #faf7fd;
  border: 1px solid rgba(161, 140, 209, 0.2);
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow: auto;
  white-space: pre-wrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02) inset;
}

.result-container {
  position: relative;
  margin-top: 35px;
  padding-top: 25px;
  border-top: 1px dashed rgba(161, 140, 209, 0.3);
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

button {
  padding: 12px 25px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Quicksand', Arial, sans-serif;
}

.btn-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

.format-btn {
  background: linear-gradient(45deg, #a18cd1 0%, #fbc2eb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(161, 140, 209, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.minify-btn {
  background: linear-gradient(45deg, #faaca8 0%, #ddd6f3 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(250, 172, 168, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.validate-btn {
  background: linear-gradient(45deg, #84fab0 0%, #8fd3f4 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(132, 250, 176, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.copy-btn {
  background: linear-gradient(45deg, #a6c1ee 0%, #fbc2eb 100%);
  color: white;
  padding: 8px 16px;
  box-shadow: 0 4px 15px rgba(166, 193, 238, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(166, 193, 238, 0.4);
}

.status-message {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.status-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

.status-success {
  background: linear-gradient(45deg, #b3ffab 0%, #12fff7 100%);
  color: #006064;
  border: 1px solid rgba(179, 255, 171, 0.3);
}

.status-error {
  background: linear-gradient(45deg, #ffb8b8 0%, #ffc6c6 100%);
  color: #ad1457;
  border: 1px solid rgba(255, 184, 184, 0.3);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 768px) {
  .formatter-container {
    padding: 20px;
  }
  
  button {
    padding: 10px 18px;
    font-size: 0.95rem;
  }
  
  h2 {
    font-size: 1.6rem;
  }
  
  .tool-icon {
    font-size: 1.6rem;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .copy-actions {
    margin-top: 10px;
  }
  
  .status-message {
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
    font-size: 0.9rem;
  }
}
</style> 