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
        <div class="input-tips">
          <div class="tip">
            <span class="tip-icon">💡</span>
            <span class="tip-text">标准JSON格式要求所有键名必须用双引号括起来，例如：{"a":1} 而非 {a:1}</span>
          </div>
          <div class="tip">
            <span class="tip-icon">🔄</span>
            <span class="tip-text">本工具会尝试自动修复一些常见格式错误</span>
          </div>
        </div>
      </div>
      
      <div class="options-panel">
        <div class="indent-option">
          <label for="indent-size">缩进空格数：</label>
          <select id="indent-size" v-model="indentSize" :disabled="useTabs">
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
          </select>
        </div>
        <div class="indent-type">
          <input type="checkbox" id="use-tabs" v-model="useTabs">
          <label for="use-tabs">使用Tab缩进</label>
        </div>
        <div class="format-type">
          <input type="checkbox" id="use-manual" v-model="useManualFormat">
          <label for="use-manual">增强格式化</label>
          <span class="tooltip">
            <span class="tooltip-icon">?</span>
            <span class="tooltip-text">适用于特殊格式或复杂JSON</span>
          </span>
        </div>
        <div class="sort-option">
          <input type="checkbox" id="sort-keys" v-model="sortKeys">
          <label for="sort-keys">按键名排序</label>
        </div>
        <div class="highlight-option">
          <input type="checkbox" id="highlight" v-model="highlight">
          <label for="highlight">语法高亮</label>
        </div>
      </div>
      
      <div class="actions">
        <button class="format-btn" @click="processJson('format')">
          <span class="btn-icon">✨</span>格式化
        </button>
        <button class="minify-btn" @click="processJson('minify')">
          <span class="btn-icon">📦</span>去除空格和换行
        </button>
        <button class="validate-btn" @click="validateJsonData">
          <span class="btn-icon">✓</span>验证
        </button>
        <button class="analyze-btn" @click="analyzeJson" v-if="formattedResult">
          <span class="btn-icon">📊</span>分析结构
        </button>
        <button class="clear-btn" @click="clearJson">
          <span class="btn-icon">🗑️</span>清空
        </button>
      </div>
      
      <div class="form-group result-container" v-if="formattedResult">
        <div class="result-header">
          <label for="output-json">结果：</label>
          <div class="view-options" v-if="highlight">
            <div class="color-theme">
              <label for="theme">主题：</label>
              <select id="theme" v-model="currentTheme" @change="reHighlight">
                <option value="default">默认</option>
                <option value="dark">暗色</option>
                <option value="pastel">柔和</option>
              </select>
            </div>
          </div>
          <div class="copy-actions">
            <button class="copy-btn" @click="copyResult">
              <span class="btn-icon">📋</span>复制结果
            </button>
          </div>
        </div>
        
        <div v-if="highlight" class="output-area highlighted" v-html="highlightedResult"></div>
        <pre v-else id="output-json" class="output-area">{{ formattedResult }}</pre>
      </div>
      
      <div class="analysis-panel" v-if="showAnalysis">
        <h3>JSON结构分析</h3>
        <div class="analysis-content">
          <div class="analysis-item">
            <span class="analysis-label">总键数：</span>
            <span class="analysis-value">{{ analysis.totalKeys }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">不同键数：</span>
            <span class="analysis-value">{{ analysis.uniqueKeys }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">最大深度：</span>
            <span class="analysis-value">{{ analysis.depth }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">对象数量：</span>
            <span class="analysis-value">{{ analysis.objectsCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">数组数量：</span>
            <span class="analysis-value">{{ analysis.arraysCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">字符串数量：</span>
            <span class="analysis-value">{{ analysis.stringsCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">数字数量：</span>
            <span class="analysis-value">{{ analysis.numbersCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">布尔值数量：</span>
            <span class="analysis-value">{{ analysis.booleansCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">null值数量：</span>
            <span class="analysis-value">{{ analysis.nullCount }}</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">最长数组长度：</span>
            <span class="analysis-value">{{ analysis.maxArrayLength }}</span>
          </div>
        </div>
        <button class="close-analysis-btn" @click="closeAnalysis">关闭分析</button>
      </div>
      
      <div class="status-message" v-if="statusMessage" :class="{ 'status-error': isError, 'status-success': !isError }">
        <span class="status-icon">{{ isError ? '❌' : '✅' }}</span>
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { 
  formatJson, 
  formatJsonWithTabs,
  manualFormatJson,
  minifyJson, 
  validateJson,
  highlightJson, 
  analyzeJsonStructure 
} from '../../utils/jsonFormatter';

export default {
  name: 'JsonFormatter',
  setup() {
    const inputJson = ref('');
    const formattedResult = ref('');
    const highlightedResult = ref('');
    const statusMessage = ref('');
    const isError = ref(false);
    const indentSize = ref(2);
    const sortKeys = ref(false);
    const highlight = ref(true);
    const currentTheme = ref('default');
    const showAnalysis = ref(false);
    const analysis = ref({});
    const useTabs = ref(false);
    const useManualFormat = ref(false);
    
    // 主题配置
    const themes = {
      default: {
        stringColor: '#0B7500',
        numberColor: '#1A01CC',
        booleanColor: '#1A01CC',
        nullColor: '#1A01CC',
        keyColor: '#881391',
        braceColor: '#000000',
        bracketColor: '#000000',
        commaColor: '#000000'
      },
      dark: {
        stringColor: '#6A8759',
        numberColor: '#6897BB',
        booleanColor: '#CC7832',
        nullColor: '#CC7832',
        keyColor: '#9876AA',
        braceColor: '#FFFFFF',
        bracketColor: '#FFFFFF',
        commaColor: '#FFFFFF'
      },
      pastel: {
        stringColor: '#98C379',
        numberColor: '#D19A66',
        booleanColor: '#56B6C2',
        nullColor: '#56B6C2',
        keyColor: '#E06C75',
        braceColor: '#ABB2BF',
        bracketColor: '#ABB2BF',
        commaColor: '#ABB2BF'
      }
    };
    
    // 当高亮或者格式化结果变化时重新生成高亮
    watch([formattedResult, highlight, currentTheme], () => {
      if (highlight.value && formattedResult.value) {
        reHighlight();
      }
    });
    
    const reHighlight = () => {
      try {
        highlightedResult.value = highlightJson(
          formattedResult.value, 
          { 
            ...themes[currentTheme.value], 
            indentSize: Number(indentSize.value),
            useTabs: useTabs.value 
          }
        );
      } catch (error) {
        console.error('高亮错误:', error);
        highlightedResult.value = formattedResult.value;
      }
    };
    
    const processJson = (type) => {
      if (!inputJson.value.trim()) {
        setStatus('请输入JSON数据', true);
        return;
      }
      
      try {
        // 预处理JSON字符串，尝试修复常见错误
        let processedInput = inputJson.value;
        
        // 尝试修复没有引号的键名 - 例如 {a:1} 转换为 {"a":1}
        processedInput = processedInput.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
        
        if (type === 'format') {
          // 根据选项使用不同的格式化方法
          if (useManualFormat.value) {
            formattedResult.value = manualFormatJson(
              processedInput,
              useTabs.value,
              Number(indentSize.value)
            );
          } else if (useTabs.value) {
            formattedResult.value = formatJsonWithTabs(
              processedInput,
              sortKeys.value
            );
          } else {
            formattedResult.value = formatJson(
              processedInput, 
              Number(indentSize.value), 
              sortKeys.value
            );
          }
          setStatus('格式化成功', false);
        } else if (type === 'minify') {
          try {
            const minified = minifyJson(processedInput);
            if (minified && minified.trim()) {
              formattedResult.value = minified;
              setStatus('压缩成功：已移除所有空白字符和换行', false);
              // 重置高亮模式，因为压缩后的JSON不需要高亮
              highlight.value = false;
            } else {
              setStatus('压缩结果为空，请检查输入', true);
              formattedResult.value = '';
            }
          } catch (error) {
            console.error('压缩出错:', error);
            // 即使出错也尝试使用基本压缩
            formattedResult.value = inputJson.value.replace(/\s+/g, '');
            setStatus('使用基本压缩方式', false);
          }
        }
      } catch (error) {
        console.error('格式化出错:', error);
        setStatus(`JSON解析错误: ${error.message}。请确保键名使用双引号，例如 {"a":1}`, true);
        formattedResult.value = '';
      }
    };
    
    const validateJsonData = () => {
      if (!inputJson.value.trim()) {
        setStatus('请输入JSON数据', true);
        return;
      }
      
      // 尝试修复常见的格式错误
      let processedInput = inputJson.value;
      // 尝试修复没有引号的键名
      processedInput = processedInput.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      
      const result = validateJson(processedInput);
      if (result.valid) {
        setStatus('验证成功：JSON格式有效', false);
      } else {
        setStatus(`验证失败：${result.message}。请确保键名使用双引号，例如 {"a":1}`, true);
      }
    };
    
    const analyzeJson = () => {
      try {
        // 尝试修复常见的格式错误
        let processedInput = inputJson.value;
        // 尝试修复没有引号的键名
        processedInput = processedInput.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
        
        analysis.value = analyzeJsonStructure(processedInput);
        showAnalysis.value = true;
      } catch (error) {
        setStatus(`分析失败：${error.message}。请确保键名使用双引号，例如 {"a":1}`, true);
      }
    };
    
    const closeAnalysis = () => {
      showAnalysis.value = false;
    };
    
    const clearJson = () => {
      inputJson.value = '';
      formattedResult.value = '';
      highlightedResult.value = '';
      statusMessage.value = '';
      showAnalysis.value = false;
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
      highlightedResult,
      statusMessage,
      isError,
      indentSize,
      sortKeys,
      highlight,
      currentTheme,
      showAnalysis,
      analysis,
      useTabs,
      useManualFormat,
      processJson,
      validateJsonData,
      analyzeJson,
      closeAnalysis,
      clearJson,
      copyResult,
      reHighlight
    };
  }
}
</script>

<style scoped>
.json-formatter {
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

h3 {
  color: #623b5a;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
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
  position: relative;
}

.options-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(161, 140, 209, 0.05);
  border-radius: 12px;
  align-items: center;
}

.indent-option, .sort-option, .highlight-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indent-option select {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(161, 140, 209, 0.2);
  font-family: 'Quicksand', Arial, sans-serif;
}

.form-group {
  margin-bottom: 25px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 15px;
}

.view-options {
  display: flex;
  gap: 15px;
  align-items: center;
}

.color-theme {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-theme select {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(161, 140, 209, 0.2);
  font-family: 'Quicksand', Arial, sans-serif;
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

.highlighted {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  overflow: auto;
}

.result-container {
  position: relative;
  margin-top: 35px;
  padding-top: 25px;
  border-top: 1px dashed rgba(161, 140, 209, 0.3);
}

.analysis-panel {
  margin-top: 35px;
  padding: 20px;
  background: rgba(251, 194, 235, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(161, 140, 209, 0.2);
  position: relative;
}

.analysis-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.analysis-label {
  font-size: 0.9rem;
  color: #623b5a;
  margin-bottom: 5px;
}

.analysis-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #a18cd1;
}

.close-analysis-btn {
  margin-top: 20px;
  background: rgba(161, 140, 209, 0.2);
  color: #623b5a;
  box-shadow: none;
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

.analyze-btn {
  background: linear-gradient(45deg, #8EC5FC 0%, #E0C3FC 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(142, 197, 252, 0.3);
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

/* 添加深色主题支持 */
:deep(.highlighted.dark-theme) {
  background-color: #2b2b2b;
  color: #a9b7c6;
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

  .options-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .analysis-content {
    grid-template-columns: 1fr;
  }
}

/* 添加JSON树视图样式 */
:deep(.json-tree) {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.json-content) {
  margin-left: 20px;
}

:deep(.json-key) {
  color: #881391;
  font-weight: bold;
}

:deep(.json-string) {
  color: #0B7500;
}

:deep(.json-number) {
  color: #1A01CC;
}

:deep(.json-boolean) {
  color: #1A01CC;
  font-weight: bold;
}

:deep(.json-null) {
  color: #1A01CC;
  font-style: italic;
}

:deep(.json-brace), :deep(.json-bracket) {
  color: #000000;
  font-weight: bold;
}

.indent-type, .format-type {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(161, 140, 209, 0.3);
  color: #623b5a;
  font-size: 12px;
  cursor: help;
}

.tooltip-text {
  visibility: hidden;
  width: 180px;
  background-color: #623b5a;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
  font-weight: normal;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #623b5a transparent transparent transparent;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.input-tips {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #623b5a;
}

.tip {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.tip-icon {
  margin-right: 8px;
  font-size: 1rem;
}

.tip-text {
  line-height: 1.4;
  opacity: 0.8;
}
</style> 