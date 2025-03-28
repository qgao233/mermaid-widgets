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
        <button class="format-btn primary-btn" @click="formatJson('format')">
          <span class="btn-icon">✨</span>格式化
        </button>
        <button class="minify-btn primary-btn" @click="formatJson('minify')">
          <span class="btn-icon">📦</span>压缩
        </button>
        <button class="validate-btn primary-btn" @click="validateJson">
          <span class="btn-icon">✓</span>验证
        </button>
        <button class="clear-btn" @click="clearJson">
          <span class="btn-icon">🗑️</span>清空
        </button>
      </div>
      
      <div class="form-group result-container" v-if="formattedResult">
        <label for="output-json">结果：</label>
        <pre id="output-json" class="output-area">{{ formattedResult }}</pre>
        <div class="copy-btn-container">
          <button class="copy-btn" @click="copyResult">
            <span class="btn-icon">📋</span>复制结果
          </button>
        </div>
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
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.8rem;
}

.tool-icon {
  margin-right: 12px;
  font-size: 1.8rem;
}

.formatter-container {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 1.05rem;
}

.input-area {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02) inset;
}

.input-area:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.output-area {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  background-color: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
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
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
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
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

.primary-btn {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.clear-btn {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(229, 57, 53, 0.3);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4);
}

.copy-btn-container {
  text-align: right;
  margin-top: 12px;
}

.copy-btn {
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
  padding: 10px 20px;
  box-shadow: 0 4px 15px rgba(75, 108, 183, 0.3);
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(75, 108, 183, 0.4);
}

.status-message {
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.status-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.status-error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid rgba(198, 40, 40, 0.2);
}

.status-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid rgba(46, 125, 50, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  
  .actions {
    gap: 10px;
  }
}
</style> 