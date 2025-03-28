/**
 * Excel公式格式化工具
 * 基于Python代码转换为JavaScript实现
 */

class Node {
  constructor(parent = null, tabSize = 0) {
    this.parent = parent;
    this.tabSize = tabSize;
    this.data = [];
  }

  isSingleNode() {
    for (let e of this.data) {
      if (typeof e !== 'string') {
        return false;
      }
    }
    return true;
  }

  getSingleText() {
    return this.data.join('');
  }
}

/**
 * 将excel公式字符串，按照一定的规则切割成数组
 * @param {string} excelFuncText 被切割的excel公式字符串
 * @returns {Array} 切割后的结果
 */
function splitTextBlocks(excelFuncText) {
  excelFuncText = excelFuncText.replace(/\n/g, '').replace(/\r/g, '');
  excelFuncText = excelFuncText.replace(/ +/g, ' ');
  
  const lines = [];
  let i = 0, j = 0;
  
  while (j < excelFuncText.length) {
    const c = excelFuncText[j];
    
    if ((c === '(' && excelFuncText[j + 1] !== ')') || c === ',') {
      lines.push(excelFuncText.substring(i, j + 1));
      i = j = j + 1;
    } else if (c === ')' && excelFuncText[j - 1] !== '(') {
      if (i < j) {
        lines.push(excelFuncText.substring(i, j));
        i = j; // 起始文件块置于)处
      }
      
      // 以下代码查找,如果中间不包含(或)，则将)和,之间的文本块加入到划分结果
      const k = excelFuncText.indexOf(',', j + 1);
      const l = k !== -1 ? excelFuncText.indexOf('(', j + 1, k) : -1;
      const m = k !== -1 ? excelFuncText.indexOf(')', j + 1, k) : -1;
      
      if (k !== -1 && l === -1 && m === -1) {
        lines.push(excelFuncText.substring(i, k + 1));
        i = j = k + 1;
      } else if (j + 1 < excelFuncText.length && excelFuncText[j + 1] !== ')') {
        lines.push(')');
        lines.push(excelFuncText[j + 1]);
        i = j = j + 2;
      } else {
        lines.push(')');
        i = j = j + 1;
      }
    } else if (c === '"') {
      const nextQuote = excelFuncText.indexOf('"', j + 1);
      j = nextQuote !== -1 ? nextQuote + 1 : j + 1;
    } else {
      j += 1;
    }
  }
  
  if (i < excelFuncText.length) {
    lines.push(excelFuncText.substring(i));
  }
  
  return lines;
}

let blankCharCount = 2;

/**
 * 合并最内层的只有纯文本子节点的节点为单个文本节点
 * @param {Node} root 被合并的节点
 * @param {number} textMaxLength 合并后的文本长度不超过该参数，则应用该合并替换原节点
 * @param {number} maxCombineLayer 最大合并层数
 */
function combineNode(root, textMaxLength = 60, maxCombineLayer = 3) {
  for (let layer = 0; layer < maxCombineLayer; layer++) {
    let noChange = true;
    const stack = [root];
    
    while (stack.length > 0) {
      const node = stack.pop();
      const tmp = {};
      
      for (let i = 0; i < node.data.length; i++) {
        const e = node.data[i];
        
        if (e instanceof Node) {
          if (e.isSingleNode()) {
            const singleText = e.getSingleText();
            if (singleText.length < textMaxLength) {
              tmp[i] = singleText;
            }
          } else {
            stack.push(e);
          }
        }
      }
      
      for (const [i, e] of Object.entries(tmp)) {
        node.data[i] = e;
      }
      
      if (Object.keys(tmp).length !== 0) {
        noChange = false;
      }
    }
    
    if (noChange) {
      break;
    }
  }
}

/**
 * 生成节点的下一行
 * @param {Node} node 节点
 * @returns {Generator} 生成器函数
 */
function* nodeNextLine(node) {
  for (let i = 0; i < node.data.length; i++) {
    const e = node.data[i];
    
    if (typeof e === 'string') {
      const tab = (i === 0 || i === node.data.length - 1) ? node.tabSize - 1 : node.tabSize;
      yield `${' '.repeat(blankCharCount * Math.max(0, tab))}${e}`;
    } else {
      yield* nodeNextLine(e);
    }
  }
}

/**
 * 将excel公式格式化成比较容易阅读的格式
 * @param {string} excelFuncText 被格式化的excel公式字符串
 * @param {number} blankCount 最终显示的格式化字符串的1个tab用几个空格表示
 * @param {boolean} combineSingleNode 是否合并纯文本节点，该参数设置为true后面的参数才生效
 * @param {number} textMaxLength 合并后的文本长度不超过该参数，则应用该合并替换原节点
 * @param {number} maxCombineLayer 最大合并层数
 * @returns {string} 格式化后的字符串
 */
export function excelFuncFormat(excelFuncText, blankCount = 2, combineSingleNode = true, textMaxLength = 60, maxCombineLayer = 3) {
  blankCharCount = blankCount;
  const blocks = splitTextBlocks(excelFuncText);
  
  let tabSize = 0;
  const root = new Node();
  let node = root;
  
  for (const block of blocks) {
    if (block.endsWith('(')) {
      tabSize += 1;
      const childNode = new Node(node, tabSize);
      node.data.push(childNode);
      node = childNode;
      node.data.push(block);
    } else if (block.startsWith(')')) {
      tabSize -= 1;
      node.data.push(block);
      node = node.parent;
    } else {
      node.data.push(block);
    }
  }
  
  if (combineSingleNode) {
    combineNode(root, textMaxLength, maxCombineLayer);
  }
  
  const result = [];
  for (const line of nodeNextLine(root)) {
    result.push(line);
  }
  
  return result.join('\n');
} 