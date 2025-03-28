<template>
  <div class="text-diff">
    <h2>文本对比工具</h2>
    <div class="diff-container">
      <div class="text-inputs">
        <div class="form-group">
          <label for="original-text">原始文本：</label>
          <textarea 
            id="original-text" 
            v-model="originalText" 
            class="input-area"
            placeholder="请输入原始文本"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="modified-text">修改后文本：</label>
          <textarea 
            id="modified-text" 
            v-model="modifiedText" 
            class="input-area"
            placeholder="请输入修改后的文本"
          ></textarea>
        </div>
      </div>
      
      <div class="actions">
        <button class="compare-btn primary-btn" @click="compareTexts">对比</button>
        <button class="clear-btn" @click="clearTexts">清空</button>
      </div>
      
      <div class="form-group" v-if="diffResult.length > 0">
        <label>对比结果：</label>
        <div class="diff-result">
          <div 
            v-for="(line, index) in diffResult" 
            :key="index" 
            class="diff-line"
            :class="{
              'diff-added': line.type === 'added',
              'diff-removed': line.type === 'removed',
              'diff-unchanged': line.type === 'unchanged'
            }"
          >
            <span class="line-prefix">{{ getLinePrefix(line.type) }}</span>
            <span class="line-content">{{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'TextDiff',
  setup() {
    const originalText = ref('');
    const modifiedText = ref('');
    const diffResult = ref([]);
    
    const compareTexts = () => {
      if (!originalText.value && !modifiedText.value) {
        alert('请输入需要对比的文本');
        return;
      }
      
      const originalLines = originalText.value.split('\n');
      const modifiedLines = modifiedText.value.split('\n');
      
      // 简单的行级对比
      const result = [];
      const maxLength = Math.max(originalLines.length, modifiedLines.length);
      
      for (let i = 0; i < maxLength; i++) {
        const originalLine = i < originalLines.length ? originalLines[i] : null;
        const modifiedLine = i < modifiedLines.length ? modifiedLines[i] : null;
        
        if (originalLine === null) {
          // 新增行
          result.push({
            type: 'added',
            text: modifiedLine
          });
        } else if (modifiedLine === null) {
          // 删除行
          result.push({
            type: 'removed',
            text: originalLine
          });
        } else if (originalLine !== modifiedLine) {
          // 修改行
          result.push({
            type: 'removed',
            text: originalLine
          });
          result.push({
            type: 'added',
            text: modifiedLine
          });
        } else {
          // 未修改行
          result.push({
            type: 'unchanged',
            text: originalLine
          });
        }
      }
      
      diffResult.value = result;
    };
    
    const clearTexts = () => {
      originalText.value = '';
      modifiedText.value = '';
      diffResult.value = [];
    };
    
    const getLinePrefix = (type) => {
      switch (type) {
        case 'added':
          return '+ ';
        case 'removed':
          return '- ';
        default:
          return '  ';
      }
    };
    
    return {
      originalText,
      modifiedText,
      diffResult,
      compareTexts,
      clearTexts,
      getLinePrefix
    };
  }
}
</script>

<style scoped>
.text-diff {
  padding: 20px 0;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.diff-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.text-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .text-inputs {
    grid-template-columns: 1fr;
  }
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
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
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

.primary-btn {
  background-color: #3498db;
  color: white;
}

.primary-btn:hover {
  background-color: #2980b9;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.diff-result {
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow: auto;
  max-height: 400px;
}

.diff-line {
  padding: 2px 0;
  display: flex;
  white-space: pre;
}

.line-prefix {
  width: 20px;
  flex-shrink: 0;
  color: #666;
}

.line-content {
  flex-grow: 1;
  overflow-x: auto;
}

.diff-added {
  background-color: #e8f5e9;
}

.diff-added .line-prefix {
  color: #388e3c;
}

.diff-removed {
  background-color: #ffebee;
}

.diff-removed .line-prefix {
  color: #d32f2f;
}
</style> 