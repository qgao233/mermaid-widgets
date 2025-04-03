<template>
  <div class="excel-formatter">
    <h2><span class="tool-icon">📊</span> Excel公式格式化工具</h2>
    <div class="formatter-container">
      <div class="form-group">
        <label for="input-formula">输入Excel公式：</label>
        <textarea 
          id="input-formula" 
          v-model="inputFormula" 
          class="input-area" 
          placeholder="请输入需要格式化的Excel公式"
        ></textarea>
      </div>
      
      <div class="actions">
        <button class="format-btn" @click="formatFormula">
          <span class="btn-icon">✨</span>格式化
        </button>
        <button class="clear-btn" @click="clearFormula">
          <span class="btn-icon">🗑️</span>清空
        </button>
      </div>
      
      <div class="form-group result-container" v-if="formattedResult">
        <div class="result-header">
          <label for="output-formula">格式化结果：</label>
          <div class="copy-actions">
            <button class="copy-btn" @click="copyResult">
              <span class="btn-icon">📋</span>复制结果
            </button>
            <div class="copy-message" v-if="showCopyMessage">
              <span class="copy-icon">✅</span> 已复制到剪贴板
            </div>
          </div>
        </div>
        <pre id="output-formula" class="output-area">{{ formattedResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { excelFuncFormat } from '../../utils/excelFormatter';

export default {
  name: 'ExcelFormatter',
  setup() {
    const inputFormula = ref('');
    const formattedResult = ref('');
    const showCopyMessage = ref(false);
    
    const formatFormula = () => {
      if (!inputFormula.value.trim()) {
        alert('请输入Excel公式');
        return;
      }
      
      try {
        formattedResult.value = excelFuncFormat(inputFormula.value);
      } catch (error) {
        console.error('格式化出错:', error);
        alert('格式化出错，请检查公式是否正确');
      }
    };
    
    const clearFormula = () => {
      inputFormula.value = '';
      formattedResult.value = '';
    };
    
    const copyResult = () => {
      if (!formattedResult.value) return;
      
      navigator.clipboard.writeText(formattedResult.value)
        .then(() => {
          showCopyMessage.value = true;
          setTimeout(() => {
            showCopyMessage.value = false;
          }, 3000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制失败');
        });
    };
    
    return {
      inputFormula,
      formattedResult,
      showCopyMessage,
      formatFormula,
      clearFormula,
      copyResult
    };
  }
}
</script>

<style scoped>
.excel-formatter {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
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

.copy-message {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background-color: #fde9f9;
  color: #8e44ad;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(251, 194, 235, 0.25);
  display: flex;
  align-items: center;
  z-index: 10;
  animation: fadeIn 0.3s ease;
  white-space: nowrap;
  border: 1px solid rgba(251, 194, 235, 0.3);
}

.copy-icon {
  margin-right: 6px;
  font-size: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
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

.format-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(161, 140, 209, 0.4);
}

.clear-btn {
  background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 154, 158, 0.4);
}

.copy-btn {
  background: linear-gradient(45deg, #a6c1ee 0%, #fbc2eb 100%);
  color: white;
  padding: 8px 16px;
  box-shadow: 0 4px 15px rgba(166, 193, 238, 0.3);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(166, 193, 238, 0.4);
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
}
</style> 