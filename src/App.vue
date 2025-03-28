<template>
  <div class="app">
    <header>
      <h1>Excel公式格式化工具</h1>
      <nav class="main-nav">
        <router-link to="/" class="nav-link">格式化工具</router-link>
        <router-link to="/examples" class="nav-link">公式示例</router-link>
      </nav>
    </header>
    <main>
      <router-view></router-view>
    </main>
    <footer>
      <p>© 2025 Excel公式格式化工具</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
  text-align: center;
}

.main-nav {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.nav-link {
  margin: 0 15px;
  color: #2196f3;
  text-decoration: none;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.router-link-active {
  color: #0b7dda;
  border-bottom: 2px solid #0b7dda;
}

footer {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  color: #666;
  font-size: 0.9rem;
}
</style> 