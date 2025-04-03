<template>
  <div class="text-diff">
    <h2>文本对比工具</h2>
    <div class="diff-container">
      <div class="diff-header">
        <div class="left-header">原始文本</div>
        <div class="right-header">修改后文本</div>
      </div>
      
      <div class="diff-code-container">
        <div class="diff-code-panel left-panel">
          <div class="diff-line-numbers" ref="leftLineNumbers">
            <div v-for="(line, index) in leftLines" :key="'left-num-'+index" class="line-number">
              {{ line.lineNumber }}
            </div>
          </div>
          <div class="diff-content">
            <textarea 
              v-model="originalText" 
              class="code-textarea" 
              @input="onOriginalTextChange"
              placeholder="请输入原始文本"
              ref="leftTextarea"
            ></textarea>
            <div class="code-highlights" ref="leftHighlights">
              <div 
                v-for="(line, index) in leftLines" 
                :key="'left-'+index" 
                class="diff-line"
                :class="{
                  'diff-removed': line.type === 'removed',
                  'diff-unchanged': line.type === 'unchanged'
                }"
              >
                <span class="line-content">{{ line.text }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="diff-code-panel right-panel">
          <div class="diff-line-numbers" ref="rightLineNumbers">
            <div v-for="(line, index) in rightLines" :key="'right-num-'+index" class="line-number">
              {{ line.lineNumber }}
            </div>
          </div>
          <div class="diff-content">
            <textarea 
              v-model="modifiedText" 
              class="code-textarea" 
              @input="onModifiedTextChange"
              placeholder="请输入修改后的文本"
              ref="rightTextarea"
            ></textarea>
            <div class="code-highlights" ref="rightHighlights">
              <div 
                v-for="(line, index) in rightLines" 
                :key="'right-'+index" 
                class="diff-line"
                :class="{
                  'diff-added': line.type === 'added',
                  'diff-unchanged': line.type === 'unchanged'
                }"
              >
                <span class="line-content">{{ line.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button class="clear-btn" @click="clearTexts">清空</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue';
import { MyersDiff } from '@/utils/myersDiff';

export default {
  name: 'TextDiff',
  setup() {
    const myersDiff = new MyersDiff();
    const originalText = ref('');
    const modifiedText = ref('');
    const diffResult = ref({
      leftLines: [],
      rightLines: []
    });
    
    // 滚动同步相关的引用
    const leftTextarea = ref(null);
    const leftHighlights = ref(null);
    const rightTextarea = ref(null);
    const rightHighlights = ref(null);
    const leftLineNumbers = ref(null);
    const rightLineNumbers = ref(null);
    
    // 分割左侧和右侧的行
    const leftLines = computed(() => {
      return diffResult.value.leftLines || [];
    });
    
    const rightLines = computed(() => {
      return diffResult.value.rightLines || [];
    });
    
    const compareTexts = () => {
      if (!originalText.value && !modifiedText.value) {
        diffResult.value = {
          leftLines: [],
          rightLines: []
        };
        return;
      }
      
      const originalLines = originalText.value.split('\n');
      const modifiedLines = modifiedText.value.split('\n');
      
      try {
        // 使用 MyersDiff 算法进行对比
        diffResult.value = myersDiff.computeDiff(originalLines, modifiedLines);
      } catch (error) {
        console.error('对比文本时出错:', error);
        alert('对比文本时出错: ' + error.message);
      }
    };

    // 原始文本变化处理函数
    const onOriginalTextChange = () => {
      compareTexts();
    };
    
    // 修改后文本变化处理函数
    const onModifiedTextChange = () => {
      compareTexts();
    };
    
    const clearTexts = () => {
      originalText.value = '';
      modifiedText.value = '';
      diffResult.value = {
        leftLines: [],
        rightLines: []
      };
    };
    
    // 处理滚动同步
    const handleLeftTextareaScroll = (e) => {
      if (!leftTextarea.value || !leftHighlights.value || !leftLineNumbers.value) return;
      
      // 同步左侧高亮层和行号的滚动位置
      leftHighlights.value.scrollTop = e.target.scrollTop;
      leftLineNumbers.value.scrollTop = e.target.scrollTop;
      
      // 同步右侧文本区域、高亮层和行号的滚动位置
      if (rightTextarea.value && rightHighlights.value && rightLineNumbers.value) {
        rightTextarea.value.scrollTop = e.target.scrollTop;
        rightHighlights.value.scrollTop = e.target.scrollTop;
        rightLineNumbers.value.scrollTop = e.target.scrollTop;
      }
    };
    
    const handleRightTextareaScroll = (e) => {
      if (!rightTextarea.value || !rightHighlights.value || !rightLineNumbers.value) return;
      
      // 同步右侧高亮层和行号的滚动位置
      rightHighlights.value.scrollTop = e.target.scrollTop;
      rightLineNumbers.value.scrollTop = e.target.scrollTop;
      
      // 同步左侧文本区域、高亮层和行号的滚动位置
      if (leftTextarea.value && leftHighlights.value && leftLineNumbers.value) {
        leftTextarea.value.scrollTop = e.target.scrollTop;
        leftHighlights.value.scrollTop = e.target.scrollTop;
        leftLineNumbers.value.scrollTop = e.target.scrollTop;
      }
    };
    
    // 组件挂载后设置滚动事件监听
    onMounted(() => {
      if (leftTextarea.value) {
        leftTextarea.value.addEventListener('scroll', handleLeftTextareaScroll);
      }
      
      if (rightTextarea.value) {
        rightTextarea.value.addEventListener('scroll', handleRightTextareaScroll);
      }
    });
    
    return {
      originalText,
      modifiedText,
      diffResult,
      leftLines,
      rightLines,
      compareTexts,
      onOriginalTextChange,
      onModifiedTextChange,
      clearTexts,
      leftTextarea,
      leftHighlights,
      rightTextarea,
      rightHighlights,
      leftLineNumbers,
      rightLineNumbers
    };
  }
}
</script>

<style scoped>
.text-diff {
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.diff-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.diff-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 10px;
}

.left-header, .right-header {
  font-weight: bold;
  color: #333;
  text-align: center;
}

.diff-code-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  flex: 1;
  min-height: 0;
}

.diff-code-panel {
  display: flex;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.diff-line-numbers {
  width: 40px;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  padding: 5px 0;
  overflow-y: auto;
  user-select: none;
}

.line-number {
  text-align: right;
  padding: 0 8px;
  color: #999;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  height: 21px;
}

.diff-content {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.code-textarea, .code-highlights {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  padding: 5px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  overflow-y: auto;
  box-sizing: border-box;
  margin: 0;
}

.code-textarea {
  border: none;
  resize: none;
  background-color: transparent;
  z-index: 1;
  color: transparent;
  caret-color: black; /* 保持光标可见 */
}

.code-highlights {
  pointer-events: none;
  z-index: 0;
  color: black;
}

.diff-line {
  height: 21px;
  white-space: pre;
}

.line-content {
  white-space: pre;
}

.diff-added {
  background-color: #e8f5e9;
}

.diff-removed {
  background-color: #ffebee;
}

.diff-unchanged {
  background-color: transparent;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.clear-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

@media (max-width: 768px) {
  .diff-code-container {
    grid-template-columns: 1fr;
  }
  
  .diff-header {
    grid-template-columns: 1fr;
  }
  
  .text-diff {
    height: auto;
    min-height: 100vh;
  }
  
  .diff-code-panel {
    height: 50vh;
  }
}
</style>