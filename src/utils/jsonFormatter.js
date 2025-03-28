/**
 * JSON格式化工具
 * 提供多种格式化选项和语法高亮功能
 */

/**
 * 预处理JSON字符串，移除所有换行符
 * @param {string} jsonString 需要处理的JSON字符串
 * @returns {string} 处理后的字符串
 */
function preProcessJson(jsonString) {
  return jsonString.replace(/\r?\n/g, '').trim();
}

/**
 * 将JSON字符串格式化为易于阅读的格式
 * @param {string} jsonString 需要格式化的JSON字符串
 * @param {number} indentSize 缩进空格数，默认为2
 * @param {boolean} sortKeys 是否对键进行排序，默认为false
 * @returns {string} 格式化后的JSON字符串
 */
export function formatJson(jsonString, indentSize = 2, sortKeys = false) {
  try {
    // 预处理：移除所有换行符
    const processedJson = preProcessJson(jsonString);
    
    // 解析JSON字符串为对象
    const jsonObj = JSON.parse(processedJson);
    
    // 格式化JSON对象
    return JSON.stringify(jsonObj, sortKeys ? sortKeysReplacer : null, indentSize);
  } catch (error) {
    throw new Error(`JSON解析错误: ${error.message}`);
  }
}

/**
 * 将JSON字符串格式化为易于阅读的格式，使用制表符而非空格
 * @param {string} jsonString 需要格式化的JSON字符串
 * @param {boolean} sortKeys 是否对键进行排序，默认为false
 * @returns {string} 使用制表符格式化的JSON字符串
 */
export function formatJsonWithTabs(jsonString, sortKeys = false) {
  try {
    // 预处理：移除所有换行符
    const processedJson = preProcessJson(jsonString);
    
    // 解析JSON字符串为对象
    const jsonObj = JSON.parse(processedJson);
    
    // 使用制表符格式化
    const result = JSON.stringify(jsonObj, sortKeys ? sortKeysReplacer : null, '\t');
    return result;
  } catch (error) {
    throw new Error(`JSON解析错误: ${error.message}`);
  }
}

/**
 * 直接为JSON字符串添加换行和缩进，不依赖于JSON.stringify
 * 适用于特殊格式需求或非标准JSON
 * @param {string} jsonString 需要格式化的JSON字符串
 * @param {boolean} useTabs 是否使用制表符而非空格
 * @param {number} indentSize 使用空格时的缩进数量
 * @returns {string} 手动格式化的JSON字符串
 */
export function manualFormatJson(jsonString, useTabs = false, indentSize = 2) {
  // 预处理：移除所有换行符和多余空格
  let str = preProcessJson(jsonString).replace(/\s+/g, ' ');
  let result = '';
  let indentLevel = 0;
  let inString = false;
  let charArray = str.split('');
  
  // 根据设置创建缩进字符串
  const indentChar = useTabs ? '\t' : ' '.repeat(indentSize);
  
  for (let i = 0; i < charArray.length; i++) {
    const char = charArray[i];
    
    // 处理字符串
    if (char === '"' && (i === 0 || charArray[i-1] !== '\\')) {
      inString = !inString;
      result += char;
      continue;
    }
    
    // 字符串内的字符直接添加
    if (inString) {
      result += char;
      continue;
    }
    
    // 处理特殊字符
    switch (char) {
      case '{':
      case '[':
        result += char + '\n' + indentChar.repeat(++indentLevel);
        break;
        
      case '}':
      case ']':
        result += '\n' + indentChar.repeat(--indentLevel) + char;
        break;
        
      case ',':
        result += char + '\n' + indentChar.repeat(indentLevel);
        break;
        
      case ':':
        result += char + ' ';
        break;
        
      default:
        result += char;
    }
  }
  
  return result;
}

/**
 * 压缩JSON字符串，移除所有空格和换行符
 * @param {string} jsonString 需要压缩的JSON字符串
 * @returns {string} 压缩后的JSON字符串
 */
export function minifyJson(jsonString) {
  try {
    if (!jsonString.trim()) {
      return '';
    }
    
    // 处理方式1：如果是标准JSON，使用JSON.parse再stringify
    try {
      // 预处理：移除所有换行符
      const processedJson = preProcessJson(jsonString);
      
      // 尝试解析JSON字符串为对象
      const jsonObj = JSON.parse(processedJson);
      
      // 压缩JSON对象，移除所有空白字符
      return JSON.stringify(jsonObj);
    } catch (parseError) {
      // 如果解析失败，使用方式2：直接移除所有空白字符
      console.log("解析失败，使用直接压缩方式:", parseError);
    }
    
    // 处理方式2：直接移除所有空白字符(保留字符串内的空格)
    let result = '';
    let inString = false;
    let inEscape = false;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      
      // 处理转义字符
      if (inString && !inEscape && char === '\\') {
        inEscape = true;
        result += char;
        continue;
      }
      
      // 在下一个字符后重置转义状态
      if (inEscape) {
        inEscape = false;
        result += char;
        continue;
      }
      
      // 处理字符串边界
      if (char === '"' && !inEscape) {
        inString = !inString;
        result += char;
        continue;
      }
      
      // 在字符串内保留所有字符
      if (inString) {
        result += char;
        continue;
      }
      
      // 在字符串外，忽略空白字符
      if (!/\s/.test(char)) {
        result += char;
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`JSON压缩错误: ${error.message}`);
  }
}

/**
 * 验证JSON字符串是否有效
 * @param {string} jsonString 需要验证的JSON字符串
 * @returns {object} 包含验证结果的对象，{valid: boolean, message: string}
 */
export function validateJson(jsonString) {
  try {
    // 预处理：移除所有换行符
    const processedJson = preProcessJson(jsonString);
    
    JSON.parse(processedJson);
    return { valid: true, message: "JSON格式有效" };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}

/**
 * 用于排序对象键的JSON.stringify替换函数
 * @param {string} key 键名
 * @param {any} value 键值
 * @returns {any} 处理后的值
 */
function sortKeysReplacer(key, value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = value[key];
        return result;
      }, {});
  }
  return value;
}

/**
 * 将JSON字符串转换为HTML，并添加语法高亮
 * @param {string} jsonString 需要高亮的JSON字符串
 * @param {object} options 高亮选项
 * @returns {string} 高亮后的HTML字符串
 */
export function highlightJson(jsonString, options = {}) {
  const defaultOptions = {
    stringColor: '#0B7500', // 字符串颜色
    numberColor: '#1A01CC', // 数字颜色
    booleanColor: '#1A01CC', // 布尔值颜色
    nullColor: '#1A01CC', // null值颜色
    keyColor: '#881391', // 键名颜色
    braceColor: '#000000', // 花括号颜色
    bracketColor: '#000000', // 方括号颜色
    commaColor: '#000000', // 逗号颜色
    indentSize: 2, // 缩进大小
    useTabs: false // 是否使用制表符
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    // 预处理：移除所有换行符
    const processedJson = preProcessJson(jsonString);
    
    // 根据选项使用合适的格式化函数
    let formatted;
    if (mergedOptions.useTabs) {
      formatted = formatJsonWithTabs(processedJson, false);
    } else if (mergedOptions.customFormat) {
      formatted = manualFormatJson(processedJson, mergedOptions.useTabs, mergedOptions.indentSize);
    } else {
      formatted = formatJson(processedJson, mergedOptions.indentSize, false);
    }
    
    // 高亮规则
    const htmlStr = formatted
      // 高亮键名
      .replace(/"([^"]+)":/g, `<span style="color:${mergedOptions.keyColor}">"$1"</span>:`)
      // 高亮字符串值
      .replace(/: "([^"]*)"/g, `: <span style="color:${mergedOptions.stringColor}">"$1"</span>`)
      // 高亮数字
      .replace(/: ([0-9]+\.?[0-9]*)/g, `: <span style="color:${mergedOptions.numberColor}">$1</span>`)
      // 高亮布尔值
      .replace(/: (true|false)/g, `: <span style="color:${mergedOptions.booleanColor}">$1</span>`)
      // 高亮null值
      .replace(/: (null)/g, `: <span style="color:${mergedOptions.nullColor}">$1</span>`)
      // 高亮花括号
      .replace(/[{}]/g, (match) => `<span style="color:${mergedOptions.braceColor}">${match}</span>`)
      // 高亮方括号
      .replace(/[\[\]]/g, (match) => `<span style="color:${mergedOptions.bracketColor}">${match}</span>`)
      // 高亮逗号
      .replace(/,/g, `<span style="color:${mergedOptions.commaColor}">,</span>`);
    
    return htmlStr;
  } catch (error) {
    throw new Error(`JSON解析错误: ${error.message}`);
  }
}

/**
 * 分析JSON结构并生成结构报告
 * @param {string} jsonString 需要分析的JSON字符串
 * @returns {object} JSON结构报告
 */
export function analyzeJsonStructure(jsonString) {
  try {
    // 预处理：移除所有换行符
    const processedJson = preProcessJson(jsonString);
    
    const jsonObj = JSON.parse(processedJson);
    
    // 初始化统计信息
    const stats = {
      totalKeys: 0,
      depth: 0,
      arraysCount: 0,
      objectsCount: 0,
      stringsCount: 0,
      numbersCount: 0,
      booleansCount: 0,
      nullCount: 0,
      maxArrayLength: 0,
      uniqueKeys: new Set()
    };
    
    // 分析结构
    analyzeStructure(jsonObj, stats, 0);
    
    return {
      totalKeys: stats.totalKeys,
      uniqueKeys: stats.uniqueKeys.size,
      depth: stats.depth,
      arraysCount: stats.arraysCount,
      objectsCount: stats.objectsCount,
      stringsCount: stats.stringsCount,
      numbersCount: stats.numbersCount,
      booleansCount: stats.booleansCount,
      nullCount: stats.nullCount,
      maxArrayLength: stats.maxArrayLength
    };
  } catch (error) {
    throw new Error(`JSON解析错误: ${error.message}`);
  }
}

/**
 * 递归分析JSON结构
 * @param {any} value 当前分析的值
 * @param {object} stats 统计信息对象
 * @param {number} depth 当前深度
 */
function analyzeStructure(value, stats, depth) {
  // 更新最大深度
  stats.depth = Math.max(stats.depth, depth);
  
  if (value === null) {
    stats.nullCount++;
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      stats.arraysCount++;
      stats.maxArrayLength = Math.max(stats.maxArrayLength, value.length);
      
      // 递归分析数组元素
      for (const item of value) {
        analyzeStructure(item, stats, depth + 1);
      }
    } else {
      stats.objectsCount++;
      
      // 递归分析对象属性
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          stats.totalKeys++;
          stats.uniqueKeys.add(key);
          analyzeStructure(value[key], stats, depth + 1);
        }
      }
    }
  } else if (typeof value === 'string') {
    stats.stringsCount++;
  } else if (typeof value === 'number') {
    stats.numbersCount++;
  } else if (typeof value === 'boolean') {
    stats.booleansCount++;
  }
}

/**
 * 将JSON转换为树状结构的HTML
 * @param {string} jsonString JSON字符串
 * @returns {string} HTML树状结构
 */
export function jsonToHtmlTree(jsonString) {
  try {
    // 预处理：移除所有换行符
    const processedJson = preProcessJson(jsonString);
    
    const jsonObj = JSON.parse(processedJson);
    return `<div class="json-tree">${generateHtmlTree(jsonObj)}</div>`;
  } catch (error) {
    throw new Error(`JSON解析错误: ${error.message}`);
  }
}

/**
 * 递归生成HTML树
 * @param {any} value 当前值
 * @param {string} key 当前键名
 * @returns {string} HTML片段
 */
function generateHtmlTree(value, key = null) {
  const keyHtml = key !== null ? `<span class="json-key">${key}:</span> ` : '';
  
  if (value === null) {
    return `<div class="json-item">${keyHtml}<span class="json-null">null</span></div>`;
  } else if (Array.isArray(value)) {
    const items = value.map((item, index) => generateHtmlTree(item, index)).join('');
    return `
      <div class="json-item">
        ${keyHtml}
        <span class="json-bracket">[</span>
        <div class="json-content">${items}</div>
        <span class="json-bracket">]</span>
      </div>
    `;
  } else if (typeof value === 'object') {
    const items = Object.keys(value).map(k => generateHtmlTree(value[k], k)).join('');
    return `
      <div class="json-item">
        ${keyHtml}
        <span class="json-brace">{</span>
        <div class="json-content">${items}</div>
        <span class="json-brace">}</span>
      </div>
    `;
  } else if (typeof value === 'string') {
    return `<div class="json-item">${keyHtml}<span class="json-string">"${value}"</span></div>`;
  } else if (typeof value === 'number') {
    return `<div class="json-item">${keyHtml}<span class="json-number">${value}</span></div>`;
  } else if (typeof value === 'boolean') {
    return `<div class="json-item">${keyHtml}<span class="json-boolean">${value}</span></div>`;
  }
  
  return `<div class="json-item">${keyHtml}${value}</div>`;
} 