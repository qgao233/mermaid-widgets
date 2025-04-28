import { generateId } from '@/utils/tools'

/**
 * 新闻爬虫服务，用于获取各大搜索引擎的时事热点新闻
 */

// 配置多个代理服务
const PROXY_SERVICES = [
  'https://api.allorigins.win/get?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-proxy.htmldriven.com/?url=',
  'https://crossorigin.me/'
]

/**
 * 使用不同代理尝试获取数据
 * @param {string} url 目标URL
 * @param {Function} logCallback 日志回调
 * @returns {Promise<any>} 响应数据
 */
async function fetchWithProxy(url, sourceName, logCallback) {
  let lastError = null
  const startTime = Date.now()
  
  for (let i = 0; i < PROXY_SERVICES.length; i++) {
    const proxyStartTime = Date.now()
    const proxy = PROXY_SERVICES[i]
    try {
      logCallback({ 
        type: 'info', 
        message: `${sourceName}: 正在尝试第 ${i + 1}/${PROXY_SERVICES.length} 个代理服务...` 
      })
      
      const response = await fetch(proxy + encodeURIComponent(url))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const proxyTime = ((Date.now() - proxyStartTime) / 1000).toFixed(2)
      
      logCallback({ 
        type: 'success', 
        message: `${sourceName}: 第 ${i + 1} 个代理服务请求成功，耗时 ${proxyTime} 秒` 
      })
      
      return proxy.includes('allorigins') ? data.contents : data
    } catch (error) {
      lastError = error
      const proxyTime = ((Date.now() - proxyStartTime) / 1000).toFixed(2)
      logCallback({ 
        type: 'error', 
        message: `${sourceName}: 第 ${i + 1} 个代理服务失败 - ${error.message}，耗时 ${proxyTime} 秒` 
      })
      
      // 如果还有下一个代理可用，提示将要切换
      if (i < PROXY_SERVICES.length - 1) {
        logCallback({ 
          type: 'info', 
          message: `${sourceName}: 准备切换到下一个代理服务...` 
        })
      }
      continue // 尝试下一个代理
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
  logCallback({ 
    type: 'error', 
    message: `${sourceName}: 所有代理服务均失败，总耗时 ${totalTime} 秒` 
  })
  throw lastError || new Error('所有代理服务均失败')
}

/**
 * 获取热点新闻数据
 * @param {Function} logCallback 日志回调函数
 * @returns {Promise<Array>} 新闻数据数组
 */
export async function fetchHotNews(logCallback = () => {}) {
  try {
    const startTime = Date.now()
    
    // 从多个来源获取新闻
    const sources = [
      { name: 'Google财经', fetch: () => fetchGoogleFinanceNews(logCallback) },
      { name: 'Bing财经', fetch: () => fetchBingFinanceNews(logCallback) },
      { name: '百度财经', fetch: () => fetchBaiduFinanceNews(logCallback) },
      { name: '新浪财经', fetch: () => fetchSinaFinanceNews(logCallback) },
      { name: '东方财富网', fetch: () => fetchEastMoneyNews(logCallback) },
      { name: '腾讯财经', fetch: () => fetchTencentFinanceNews(logCallback) }
    ]
    
    logCallback({ 
      type: 'info', 
      message: `开始从 ${sources.map(s => s.name).join('、')} 获取新闻数据` 
    })
    
    const results = await Promise.allSettled(
      sources.map(async ({ name, fetch }) => {
        const sourceStartTime = Date.now()
        try {
          logCallback({ 
            type: 'info', 
            message: `开始获取 ${name} 新闻...` 
          })
          
          const news = await fetch()
          const sourceTime = ((Date.now() - sourceStartTime) / 1000).toFixed(2)
          
          if (!news || news.length === 0) {
            logCallback({ 
              type: 'error', 
              message: `${name}: 失败 - 未获取到任何新闻，耗时 ${sourceTime} 秒` 
            })
            return []
          }
          
          logCallback({ 
            type: 'success', 
            message: `${name}: 成功 - 获取到 ${news.length} 条新闻，耗时 ${sourceTime} 秒` 
          })
          return news
        } catch (error) {
          const sourceTime = ((Date.now() - sourceStartTime) / 1000).toFixed(2)
          logCallback({ 
            type: 'error', 
            message: `${name}: 失败 - ${error.message}，耗时 ${sourceTime} 秒` 
          })
          return []
        }
      })
    )
    
    // 合并去重新闻数据
    const allNews = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        return [...acc, ...result.value]
      }
      return acc
    }, [])
    
    const mergedNews = mergeAndDeduplicateNews(allNews)
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
    
    // 统计成功和失败的来源数量
    const successCount = results.reduce((count, result) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        return count + 1
      }
      return count
    }, 0)
    
    const failureCount = sources.length - successCount
    
    logCallback({ 
      type: 'success', 
      message: `新闻爬取完成：\n` +
               `- ${successCount} 个来源成功，${failureCount} 个来源失败\n` +
               `- 共获取到 ${mergedNews.length} 条有效新闻（去重后）\n` +
               `- 总耗时 ${totalTime} 秒` 
    })
    
    return mergedNews
  } catch (error) {
    const errorTime = ((Date.now() - startTime) / 1000).toFixed(2)
    logCallback({ 
      type: 'error', 
      message: `新闻爬取失败: ${error.message}，总耗时 ${errorTime} 秒` 
    })
    throw new Error('获取热点新闻失败: ' + error.message)
  }
}

/**
 * 从Google获取金融新闻
 */
async function fetchGoogleFinanceNews(logCallback) {
  try {
    const targetUrl = 'https://news.google.com/rss/search?q=finance+stocks+market&hl=zh-CN&gl=CN&ceid=CN:zh-Hans'
    const data = await fetchWithProxy(targetUrl, 'Google财经', logCallback)
    
    // 使用DOMParser解析RSS数据
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(data, "text/xml")
    const items = xmlDoc.querySelectorAll('item')
    const newsItems = []
    
    items.forEach((item, index) => {
      if (index < 5) { // 限制获取条数
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        
        newsItems.push({
          id: generateId(),
          title,
          summary: description.substring(0, 150) + '...',
          url: link,
          source: 'Google财经',
          publishedAt: new Date(pubDate).toISOString()
        })
      }
    })
    
    return newsItems
  } catch (error) {
    throw new Error(`获取Google新闻失败: ${error.message}`)
  }
}

/**
 * 从Bing获取金融新闻
 */
async function fetchBingFinanceNews(logCallback) {
  try {
    const targetUrl = 'https://www.bing.com/news/search?q=stock+market+finance&format=rss'
    const data = await fetchWithProxy(targetUrl, 'Bing财经', logCallback)
    
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(data, "text/xml")
    const items = xmlDoc.querySelectorAll('item')
    const newsItems = []
    
    items.forEach((item, index) => {
      if (index < 5) {
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        
        newsItems.push({
          id: generateId(),
          title,
          summary: description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          url: link,
          source: 'Bing财经',
          publishedAt: new Date(pubDate).toISOString()
        })
      }
    })
    
    return newsItems
  } catch (error) {
    throw new Error(`获取Bing新闻失败: ${error.message}`)
  }
}

/**
 * 从百度获取金融新闻
 */
async function fetchBaiduFinanceNews(logCallback) {
  try {
    const targetUrl = 'https://baijiahao.baidu.com/s?id=1683323836058966723'
    const data = await fetchWithProxy(targetUrl, '百度财经', logCallback)
    
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(data, "text/html")
    const newsItems = []
    
    // 百度百家号文章列表
    const articleItems = htmlDoc.querySelectorAll('.article-list .article-item')
    
    for (let i = 0; i < articleItems.length && i < 5; i++) {
      const element = articleItems[i]
      const titleElement = element.querySelector('.article-title')
      const title = titleElement?.textContent?.trim() || ''
      const link = 'https://baijiahao.baidu.com' + (titleElement?.getAttribute('href') || '')
      const summary = element.querySelector('.article-summary')?.textContent?.trim() || ''
      
      newsItems.push({
        id: generateId(),
        title,
        summary: summary.substring(0, 150) + '...',
        url: link,
        source: '百度财经',
        publishedAt: new Date().toISOString()
      })
    }
    
    return newsItems
  } catch (error) {
    throw new Error(`获取百度新闻失败: ${error.message}`)
  }
}

/**
 * 从新浪财经获取新闻
 */
async function fetchSinaFinanceNews(logCallback) {
  try {
    const targetUrl = 'https://finance.sina.com.cn/stock/'
    const data = await fetchWithProxy(targetUrl, '新浪财经', logCallback)
    
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(data, "text/html")
    const newsItems = []
    
    // 新浪财经股票新闻
    const newsElements = htmlDoc.querySelectorAll('.news-list li')
    
    for (let i = 0; i < newsElements.length && i < 5; i++) {
      const element = newsElements[i]
      const linkElement = element.querySelector('a')
      const title = linkElement?.textContent?.trim() || ''
      const link = linkElement?.getAttribute('href') || ''
      
      newsItems.push({
        id: generateId(),
        title,
        summary: '新浪财经热点新闻',
        url: link,
        source: '新浪财经',
        publishedAt: new Date().toISOString()
      })
    }
    
    return newsItems
  } catch (error) {
    throw new Error(`获取新浪财经新闻失败: ${error.message}`)
  }
}

/**
 * 从东方财富网获取新闻
 */
async function fetchEastMoneyNews(logCallback) {
  try {
    const targetUrl = 'https://finance.eastmoney.com/a/cgnjj.html'
    const data = await fetchWithProxy(targetUrl, '东方财富网', logCallback)
    
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(data, "text/html")
    const newsItems = []
    
    // 东方财富网新闻列表
    const titleElements = htmlDoc.querySelectorAll('.articleList .title')
    
    for (let i = 0; i < titleElements.length && i < 5; i++) {
      const element = titleElements[i]
      const linkElement = element.querySelector('a')
      const title = linkElement?.textContent?.trim() || ''
      const link = linkElement?.getAttribute('href') || ''
      
      newsItems.push({
        id: generateId(),
        title,
        summary: '东方财富网热点新闻',
        url: link,
        source: '东方财富网',
        publishedAt: new Date().toISOString()
      })
    }
    
    return newsItems
  } catch (error) {
    throw new Error(`获取东方财富网新闻失败: ${error.message}`)
  }
}

/**
 * 从腾讯财经获取新闻
 */
async function fetchTencentFinanceNews(logCallback) {
  try {
    const targetUrl = 'https://finance.qq.com/stock/'
    const data = await fetchWithProxy(targetUrl, '腾讯财经', logCallback)
    
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(data, "text/html")
    const newsItems = []
    
    // 腾讯财经股票新闻
    const listItems = htmlDoc.querySelectorAll('.list li')
    
    for (let i = 0; i < listItems.length && i < 5; i++) {
      const element = listItems[i]
      const linkElement = element.querySelector('a')
      const title = linkElement?.textContent?.trim() || ''
      const link = linkElement?.getAttribute('href') || ''
      
      newsItems.push({
        id: generateId(),
        title,
        summary: '腾讯财经热点新闻',
        url: link,
        source: '腾讯财经',
        publishedAt: new Date().toISOString()
      })
    }
    
    return newsItems
  } catch (error) {
    throw new Error(`获取腾讯财经新闻失败: ${error.message}`)
  }
}

/**
 * 合并并去重新闻数据
 */
function mergeAndDeduplicateNews(newsArray) {
  // 创建一个Map用于去重，以标题为键
  const uniqueNewsMap = new Map();
  
  for (const news of newsArray) {
    // 简化的去重逻辑，仅基于标题
    // 实际应用中可能需要更复杂的相似度算法
    const key = news.title.toLowerCase().trim();
    
    if (!uniqueNewsMap.has(key)) {
      uniqueNewsMap.set(key, news);
    }
  }
  
  // 转换回数组并按发布时间排序
  return Array.from(uniqueNewsMap.values())
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// 用于测试的函数
export async function testNewsService() {
  try {
    const news = await fetchHotNews();
    console.log('获取到的新闻数量:', news.length);
    console.log('新闻示例:', news.slice(0, 2));
    return news;
  } catch (error) {
    console.error('测试新闻服务失败:', error);
    return [];
  }
} 