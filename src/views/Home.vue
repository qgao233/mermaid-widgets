<template>
  <div class="home">
    <h2>Excel公式格式化工具</h2>
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
        <button class="format-btn" @click="formatFormula">格式化</button>
        <button class="clear-btn" @click="clearFormula">清空</button>
      </div>
      
      <div class="form-group" v-if="formattedResult">
        <label for="output-formula">格式化结果：</label>
        <pre id="output-formula" class="output-area">{{ formattedResult }}</pre>
        <div class="copy-btn-container">
          <button class="copy-btn" @click="copyResult">复制结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { excelFuncFormat } from '../utils/excelFormatter';

export default {
  name: 'Home',
  setup() {
    const inputFormula = ref('');
    const formattedResult = ref('');
    
    // 从sessionStorage获取示例公式
    onMounted(() => {
      const exampleFormula = sessionStorage.getItem('exampleFormula');
      if (exampleFormula) {
        inputFormula.value = exampleFormula;
        sessionStorage.removeItem('exampleFormula');
      }
    });
    
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
          alert('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制失败');
        });
    };
    
    return {
      inputFormula,
      formattedResult,
      formatFormula,
      clearFormula,
      copyResult
    };
  }
}
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.formatter-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.input-area {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
}

.output-area {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow: auto;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.format-btn {
  background-color: #4caf50;
  color: white;
}

.format-btn:hover {
  background-color: #45a049;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.copy-btn-container {
  text-align: right;
  margin-top: 8px;
}

.copy-btn {
  background-color: #2196f3;
  color: white;
}

.copy-btn:hover {
  background-color: #0b7dda;
}
</style> 