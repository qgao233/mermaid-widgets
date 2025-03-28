<template>
  <div class="examples">
    <h2>Excel公式示例</h2>
    
    <div class="examples-container">
      <div v-for="(example, index) in examples" :key="index" class="example-card">
        <h3>{{ example.title }}</h3>
        <p class="description">{{ example.description }}</p>
        <pre class="code">{{ example.formula }}</pre>
        <div class="example-actions">
          <button class="use-btn" @click="useExample(example.formula)">使用此公式</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'Examples',
  setup() {
    const router = useRouter();
    
    const examples = [
      {
        title: 'SUMIFS函数',
        description: '根据多个条件求和',
        formula: 'SUMIFS(C2:C20,A2:A20,">=1/1/2022",A2:A20,"<=12/31/2022",B2:B20,"销售")'
      },
      {
        title: 'IF嵌套',
        description: '多层条件判断',
        formula: 'IF(A1>100,IF(B1="是","优秀",IF(C1>90,"良好","一般")),"不合格")'
      },
      {
        title: 'VLOOKUP函数',
        description: '从表格中查找数据',
        formula: 'VLOOKUP(A2,Sheet2!A:C,3,FALSE)'
      },
      {
        title: '复杂INDEX/MATCH组合',
        description: '二维查找',
        formula: 'INDEX(B2:F10,MATCH(A15,A2:A10,0),MATCH(B15,B1:F1,0))'
      },
      {
        title: '日期计算',
        description: '计算工作日',
        formula: 'NETWORKDAYS(A1,B1,Holidays!A:A)'
      },
      {
        title: '复杂公式嵌套',
        description: '包含多函数嵌套的复杂公式',
        formula: 'IF(AND(A1>DATE(2022,1,1),A1<DATE(2022,12,31)),SUMPRODUCT((B1:B100="完成")*(C1:C100>100))/COUNTA(B1:B100),IF(OR(D1="高级",E1>10),AVERAGEIF(F1:F100,">0")+G1*10,0))'
      }
    ];
    
    const useExample = (formula) => {
      // 将公式存储在sessionStorage中
      sessionStorage.setItem('exampleFormula', formula);
      // 导航到主页
      router.push('/');
    };
    
    return {
      examples,
      useExample
    };
  }
}
</script>

<style scoped>
.examples {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.examples-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.example-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #2196f3;
  margin-top: 0;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 15px;
}

.code {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow-x: auto;
  margin-bottom: 15px;
}

.example-actions {
  text-align: right;
}

.use-btn {
  background-color: #4caf50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.use-btn:hover {
  background-color: #45a049;
}
</style> 