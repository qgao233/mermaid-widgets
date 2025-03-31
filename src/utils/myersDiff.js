/**
 * Myers差分算法实现
 * 用于比较两个文本序列并生成差异
 */

// 基础路径节点类
export class PathNode {
  constructor(i, j, prev) {
    this.I = i;
    this.J = j;
    this.Prev = prev;
  }

  isSnake() {
    return false;
  }
}

// 差异节点类
export class DiffNode extends PathNode {
  constructor(i, j, prev) {
    super(i, j, prev);
  }
}

// 蛇节点类（表示连续的相同内容）
export class Snake extends PathNode {
  constructor(i, j, prev) {
    super(i, j, prev);
  }

  isSnake() {
    return true;
  }
}

// 比较器接口
export class DefaultEqualizer {
  equals(original, revised) {
    return original === revised;
  }
}

/**
 * Myers差分算法实现类
 */
export class MyersDiff {
  constructor(equalizer = null) {
    this.equalizer = equalizer || new DefaultEqualizer();
  }

  /**
   * 比较两个元素是否相等
   * @param {*} original 原始元素
   * @param {*} revised 修改后元素
   * @returns {boolean} 是否相等
   */
  equals(original, revised) {
    return this.equalizer.equals(original, revised);
  }

  /**
   * 构建差异路径
   * @param {Array} orig 原始序列
   * @param {Array} rev 修改序列
   * @returns {PathNode} 差异路径
   */
  buildPath(orig, rev) {
    if (!orig) throw new Error("原始序列为空");
    if (!rev) throw new Error("修改序列为空");

    const N = orig.length;
    const M = rev.length;
    const MAX = N + M + 1;
    const size = 1 + 2 * MAX;
    const middle = Math.floor(size / 2);

    const diagonal = new Array(size);
    diagonal[middle + 1] = new Snake(0, -1, null);

    for (let d = 0; d < MAX; d++) {
      for (let k = -d; k <= d; k += 2) {
        const kmiddle = middle + k;
        const kplus = kmiddle + 1;
        const kminus = kmiddle - 1;

        let i;
        let prev;
        if (k === -d || (k !== d && (diagonal[kminus]?.I < diagonal[kplus]?.I))) {
          i = diagonal[kplus]?.I || 0;
          prev = diagonal[kplus];
        } else {
          i = (diagonal[kminus]?.I + 1) || 1;
          prev = diagonal[kminus];
        }

        let j = i - k;

        diagonal[kminus] = null;

        let node = new DiffNode(i, j, prev);

        while (i < N && j < M && this.equals(orig[i], rev[j])) {
          i++;
          j++;
        }

        if (i > node.I) {
          node = new Snake(i, j, node);
        }

        diagonal[kmiddle] = node;

        if (i >= N && j >= M) {
          return diagonal[kmiddle];
        }
      }
    }

    throw new Error("无法找到差异路径");
  }

  /**
   * 构建差异结果
   * @param {PathNode} path 差异路径
   * @param {Array} orig 原始序列
   * @param {Array} rev 修改序列
   * @returns {Object} 差异结果，包含三个数组：result, leftLines, rightLines
   */
  buildDiff(path, orig, rev) {
    if (!path) throw new Error("路径为空");
    if (!orig) throw new Error("原始序列为空");
    if (!rev) throw new Error("修改序列为空");

    const result = [];
    const leftLines = [];
    const rightLines = [];
    
    let leftLineNumber = 1;
    let rightLineNumber = 1;

    const diffPath = [];
    let currentNode = path;
    while (currentNode && currentNode.Prev) {
      diffPath.push(currentNode);
      currentNode = currentNode.Prev;
    }
    diffPath.reverse();

    let lastI = 0;
    let lastJ = 0;

    for (let idx = 0; idx < diffPath.length; idx++) {
      const current = diffPath[idx];
      
      if (current.isSnake()) {
        // 处理未修改的部分
        for (let i = lastI; i < current.I; i++) {
          const j = i - (lastI - lastJ);
          leftLines.push({
            type: 'unchanged',
            text: orig[i],
            lineNumber: leftLineNumber++
          });
          rightLines.push({
            type: 'unchanged',
            text: rev[j],
            lineNumber: rightLineNumber++
          });
          result.push({
            type: 'unchanged',
            text: orig[i]
          });
        }
      } else {
        // 处理修改的部分
        if (current.I > lastI && current.J > lastJ) {
          // 修改行
          leftLines.push({
            type: 'modified',
            text: orig[current.I - 1],
            lineNumber: leftLineNumber++
          });
          rightLines.push({
            type: 'modified',
            text: rev[current.J - 1],
            lineNumber: rightLineNumber++
          });
          result.push({
            type: 'removed',
            text: orig[current.I - 1]
          });
          result.push({
            type: 'added',
            text: rev[current.J - 1]
          });
        } else if (current.I > lastI) {
          // 删除行
          leftLines.push({
            type: 'removed',
            text: orig[current.I - 1],
            lineNumber: leftLineNumber++
          });
          result.push({
            type: 'removed',
            text: orig[current.I - 1]
          });
        } else if (current.J > lastJ) {
          // 新增行
          rightLines.push({
            type: 'added',
            text: rev[current.J - 1],
            lineNumber: rightLineNumber++
          });
          result.push({
            type: 'added',
            text: rev[current.J - 1]
          });
        }
      }
      
      lastI = current.I;
      lastJ = current.J;
    }

    return { result, leftLines, rightLines };
  }

  /**
   * 执行差异比较，一步完成路径构建和差异构建
   * @param {Array} originalLines 原始文本行数组
   * @param {Array} modifiedLines 修改后文本行数组
   * @returns {Object} 差异结果
   */
  computeDiff(originalLines, modifiedLines) {
    try {
      const path = this.buildPath(originalLines, modifiedLines);
      return this.buildDiff(path, originalLines, modifiedLines);
    } catch (error) {
      console.error('对比文本时出错:', error);
      throw error;
    }
  }
} 