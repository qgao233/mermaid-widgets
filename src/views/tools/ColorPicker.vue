<template>
  <div class="color-picker">
    <h1>颜色选择器</h1>
    
    <div class="color-picker-container">
      <div class="picker-section">
        <div class="form-group">
          <label for="color-input">选择颜色</label>
          <input 
            type="color" 
            id="color-input" 
            v-model="selectedColor"
            @input="updateColorValues"
          >
        </div>
        
        <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
        
        <div class="form-group">
          <label for="hex-value">HEX</label>
          <div class="input-with-button">
            <input 
              type="text" 
              id="hex-value" 
              v-model="hexValue"
              @input="updateFromHex"
            >
            <button @click="copyToClipboard(hexValue)">复制</button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="rgb-value">RGB</label>
          <div class="input-with-button">
            <input 
              type="text" 
              id="rgb-value" 
              v-model="rgbValue"
              readonly
            >
            <button @click="copyToClipboard(rgbValue)">复制</button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="hsl-value">HSL</label>
          <div class="input-with-button">
            <input 
              type="text" 
              id="hsl-value" 
              v-model="hslValue"
              readonly
            >
            <button @click="copyToClipboard(hslValue)">复制</button>
          </div>
        </div>
      </div>
      
      <div class="palette-section">
        <h2>颜色方案</h2>
        
        <div class="palette-type">
          <button 
            v-for="(type, index) in paletteTypes" 
            :key="index"
            :class="{ active: selectedPaletteType === type.value }"
            @click="changePaletteType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
        
        <div class="color-palette">
          <div 
            v-for="(color, index) in colorPalette" 
            :key="index"
            class="palette-color"
            :style="{ backgroundColor: color }"
            @click="selectPaletteColor(color)"
          >
            <div class="color-label">{{ color }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="status-message" v-if="statusMessage">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';

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
          colors.push(hslToHex((h + 180) % 360, s, l - 10));
          colors.push(hslToHex((h + 180) % 360, s, l + 10));
          colors.push(hslToHex(h, s, l - 10));
          break;
        case 'triadic':
          // 三元色，均分色相
          colors.push(hslToHex(h, s, l));
          colors.push(hslToHex((h + 120) % 360, s, l));
          colors.push(hslToHex((h + 240) % 360, s, l));
          colors.push(hslToHex((h + 60) % 360, s, l));
          colors.push(hslToHex((h + 180) % 360, s, l));
          break;
        case 'monochromatic':
          // 单色调，相同色相不同亮度
          colors.push(hslToHex(h, s, l));
          colors.push(hslToHex(h, s, Math.max(0, l - 20)));
          colors.push(hslToHex(h, s, Math.max(0, l - 40)));
          colors.push(hslToHex(h, s, Math.min(100, l + 20)));
          colors.push(hslToHex(h, s, Math.min(100, l + 40)));
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
    
    // 复制到剪贴板
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          statusMessage.value = '已复制到剪贴板';
          setTimeout(() => {
            statusMessage.value = '';
          }, 2000);
        })
        .catch(err => {
          statusMessage.value = '复制失败';
          console.error('复制失败: ', err);
        });
    };
    
    // 选择调色板中的颜色
    const selectPaletteColor = (color) => {
      selectedColor.value = color;
      hexValue.value = color;
      rgbValue.value = hexToRgb(color);
      hslValue.value = hexToHsl(color);
    };
    
    // 改变调色板类型
    const changePaletteType = (type) => {
      selectedPaletteType.value = type;
    };
    
    // 调色板颜色计算
    const colorPalette = computed(() => {
      return generateColorPalette(selectedPaletteType.value, selectedColor.value);
    });
    
    // 监听selectedColor变化更新其他值
    watch(selectedColor, updateColorValues);
    
    // 组件加载时更新颜色值
    onMounted(() => {
      updateColorValues();
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
      copyToClipboard,
      selectPaletteColor,
      changePaletteType
    };
  }
}
</script>

<style scoped>
.color-picker {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 24px;
  color: #333;
}

h2 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.color-picker-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #555;
}

input[type="color"] {
  width: 100%;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
}

.color-preview {
  width: 100%;
  height: 60px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.input-with-button {
  display: flex;
}

input[type="text"] {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  font-size: 0.875rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px 0 0 4px;
  outline: none;
}

input[type="text"]:focus {
  border-color: #2196f3;
}

button {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-left: none;
  height: 36px;
  padding: 0 12px;
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 0 4px 4px 0;
  color: #555;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #e0e0e0;
}

.palette-type {
  display: flex;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.palette-type button {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #555;
  transition: all 0.2s;
}

.palette-type button:hover {
  background-color: #e0e0e0;
}

.palette-type button.active {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.palette-color {
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: transform 0.2s;
}

.palette-color:hover {
  transform: scale(1.05);
}

.color-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px;
  font-size: 0.7rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.palette-color:hover .color-label {
  opacity: 1;
}

.status-message {
  margin-top: 20px;
  padding: 8px 12px;
  background-color: #e3f2fd;
  color: #2196f3;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 768px) {
  .color-picker-container {
    grid-template-columns: 1fr;
  }
  
  .palette-color {
    aspect-ratio: auto;
    height: 60px;
  }
}
</style> 