<template>
  <div class="color-picker">
    <h2>颜色选择器</h2>
    <div class="color-picker-container">
      <div class="picker-section">
        <div class="form-group">
          <label for="color-input">选择颜色：</label>
          <input 
            type="color" 
            id="color-input" 
            v-model="selectedColor"
            class="color-input"
            @input="updateColorValues"
          >
        </div>
        
        <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
        
        <div class="form-group">
          <label for="hex-value">HEX值：</label>
          <div class="color-value-container">
            <input 
              type="text" 
              id="hex-value" 
              v-model="hexValue"
              class="color-value"
              @input="updateFromHex"
            >
            <button class="copy-btn" @click="copyToClipboard(hexValue)">复制</button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="rgb-value">RGB值：</label>
          <div class="color-value-container">
            <input 
              type="text" 
              id="rgb-value" 
              v-model="rgbValue"
              class="color-value"
              readonly
            >
            <button class="copy-btn" @click="copyToClipboard(rgbValue)">复制</button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="hsl-value">HSL值：</label>
          <div class="color-value-container">
            <input 
              type="text" 
              id="hsl-value" 
              v-model="hslValue"
              class="color-value"
              readonly
            >
            <button class="copy-btn" @click="copyToClipboard(hslValue)">复制</button>
          </div>
        </div>
      </div>
      
      <div class="palette-section">
        <h3>颜色方案：</h3>
        <div class="color-palette">
          <div 
            v-for="(color, index) in colorPalette" 
            :key="index"
            class="palette-color"
            :style="{ backgroundColor: color }"
            @click="selectPaletteColor(color)"
          >
            <div class="palette-color-info">{{ color }}</div>
          </div>
        </div>
        
        <div class="palette-type">
          <button 
            v-for="(type, index) in paletteTypes" 
            :key="index"
            class="palette-type-btn"
            :class="{ active: selectedPaletteType === type.value }"
            @click="changePaletteType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
      
      <div class="status-message" v-if="statusMessage">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ColorPicker',
  setup() {
    const selectedColor = ref('#2196f3');
    const hexValue = ref('#2196f3');
    const rgbValue = ref('');
    const hslValue = ref('');
    const statusMessage = ref('');
    const selectedPaletteType = ref('analogous');
    
    const paletteTypes = [
      { label: '类似色', value: 'analogous' },
      { label: '互补色', value: 'complementary' },
      { label: '三元色', value: 'triadic' },
      { label: '单色调', value: 'monochromatic' }
    ];
    
    // 更新颜色值
    const updateColorValues = () => {
      hexValue.value = selectedColor.value;
      rgbValue.value = hexToRgb(selectedColor.value);
      hslValue.value = hexToHsl(selectedColor.value);
    };
    
    // 从HEX更新其他值
    const updateFromHex = () => {
      if (/^#[0-9A-F]{6}$/i.test(hexValue.value)) {
        selectedColor.value = hexValue.value;
        rgbValue.value = hexToRgb(hexValue.value);
        hslValue.value = hexToHsl(hexValue.value);
      }
    };
    
    // HEX转RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '';
      
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    // HEX转HSL
    const hexToHsl = (hex) => {
      // 转换为RGB
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '';
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
      }
      
      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      
      return `hsl(${h}, ${s}%, ${l}%)`;
    };
    
    // 生成颜色方案
    const generateColorPalette = (type, baseColor) => {
      // 提取HSL值
      const hslMatch = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i.exec(hexToHsl(baseColor));
      if (!hslMatch) return [];
      
      const h = parseInt(hslMatch[1]);
      const s = parseInt(hslMatch[2]);
      const l = parseInt(hslMatch[3]);
      
      const colors = [];
      
      switch (type) {
        case 'analogous':
          // 类似色，相邻色相
          colors.push(hslToHex(h, s, l));
          colors.push(hslToHex((h + 30) % 360, s, l));
          colors.push(hslToHex((h + 60) % 360, s, l));
          colors.push(hslToHex((h - 30 + 360) % 360, s, l));
          colors.push(hslToHex((h - 60 + 360) % 360, s, l));
          break;
          
        case 'complementary':
          // 互补色，相对色相
          colors.push(hslToHex(h, s, l));
          colors.push(hslToHex((h + 180) % 360, s, l));
          colors.push(hslToHex((h + 180) % 360, s, Math.max(l - 20, 0)));
          colors.push(hslToHex((h + 180) % 360, Math.max(s - 20, 0), l));
          colors.push(hslToHex(h, Math.max(s - 20, 0), l));
          break;
          
        case 'triadic':
          // 三元色，三等分色环
          colors.push(hslToHex(h, s, l));
          colors.push(hslToHex((h + 120) % 360, s, l));
          colors.push(hslToHex((h + 240) % 360, s, l));
          colors.push(hslToHex((h + 120) % 360, Math.min(s + 10, 100), l));
          colors.push(hslToHex((h + 240) % 360, Math.min(s + 10, 100), l));
          break;
          
        case 'monochromatic':
          // 单色调，同一色相不同明度饱和度
          colors.push(hslToHex(h, s, l));
          colors.push(hslToHex(h, s, Math.max(l - 20, 0)));
          colors.push(hslToHex(h, s, Math.min(l + 20, 100)));
          colors.push(hslToHex(h, Math.max(s - 20, 0), l));
          colors.push(hslToHex(h, Math.min(s + 20, 100), l));
          break;
      }
      
      return colors;
    };
    
    // HSL转HEX
    const hslToHex = (h, s, l) => {
      h /= 360;
      s /= 100;
      l /= 100;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    
    // 选择色板颜色
    const selectPaletteColor = (color) => {
      selectedColor.value = color;
      hexValue.value = color;
      updateColorValues();
    };
    
    // 更改调色板类型
    const changePaletteType = (type) => {
      selectedPaletteType.value = type;
    };
    
    // 复制到剪贴板
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          showStatusMessage('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          showStatusMessage('复制失败');
        });
    };
    
    // 显示状态消息
    const showStatusMessage = (message) => {
      statusMessage.value = message;
      
      setTimeout(() => {
        if (statusMessage.value === message) {
          statusMessage.value = '';
        }
      }, 2000);
    };
    
    // 计算属性：颜色方案
    const colorPalette = computed(() => {
      return generateColorPalette(selectedPaletteType.value, selectedColor.value);
    });
    
    // 初始化
    updateColorValues();
    
    // 监听调色板类型变化
    watch(selectedPaletteType, () => {
      // 当调色板类型变化时，不做特殊处理，由计算属性自动更新
    });
    
    return {
      selectedColor,
      hexValue,
      rgbValue,
      hslValue,
      statusMessage,
      paletteTypes,
      selectedPaletteType,
      colorPalette,
      updateColorValues,
      updateFromHex,
      selectPaletteColor,
      changePaletteType,
      copyToClipboard
    };
  }
}
</script>

<style scoped>
.color-picker {
  padding: 20px 0;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.color-picker-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.picker-section {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.color-input {
  width: 100%;
  height: 50px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.color-preview {
  width: 100%;
  height: 100px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.color-value-container {
  display: flex;
  gap: 10px;
}

.color-value {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.copy-btn {
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #2980b9;
}

.palette-section {
  margin-top: 30px;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.palette-color {
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;
}

.palette-color:hover {
  transform: scale(1.05);
}

.palette-color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 4px;
  text-align: center;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.palette-color:hover .palette-color-info {
  opacity: 1;
}

.palette-type {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.palette-type-btn {
  padding: 8px 12px;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.palette-type-btn:hover {
  background-color: #e1e1e1;
}

.palette-type-btn.active {
  background-color: #3498db;
  color: white;
}

.status-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #e8f5e9;
  color: #388e3c;
  border: 1px solid #4caf50;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 768px) {
  .color-palette {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style> 