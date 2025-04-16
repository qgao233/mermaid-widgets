/**
 * 股票分析工具，用于获取股票数据和分析推荐股票
 */

/**
 * 从Alpha Vantage API获取股票数据
 * @param {Array} symbols 股票代码数组
 * @returns {Promise<Array>} 股票数据数组
 */
export async function getStockData(symbols) {
  if (!symbols || symbols.length === 0) {
    return [];
  }

  try {
    // 因为Alpha Vantage免费版API有调用限制，这里串行处理
    const stockDataArray = [];
    
    for (const symbol of symbols) {
      // 调用Alpha Vantage API获取股票数据
      // Alpha Vantage免费版API支持5次/分钟，500次/天的调用限制
      const apiKey = 'XZQP7MWMBYS5WQOC'; // 这是一个示例API key，实际应用中应当使用环境变量
      
      // 获取公司概况
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
      const overviewResponse = await fetch(overviewUrl);
      const overviewData = await overviewResponse.json();
      
      // 获取最新价格
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const quoteResponse = await fetch(quoteUrl);
      const quoteData = await quoteResponse.json();
      
      // 获取历史数据
      const historyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
      const historyResponse = await fetch(historyUrl);
      const historyData = await historyResponse.json();
      
      // 处理API限制，延迟请求
      if (symbols.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15秒延迟，避免API限制
      }
      
      // 提取股票数据
      const stockData = extractStockData(symbol, overviewData, quoteData, historyData);
      if (stockData) {
        stockDataArray.push(stockData);
      }
    }
    
    return stockDataArray;
  } catch (error) {
    console.error('获取股票数据失败:', error);
    return [];
  }
}

/**
 * 从API响应中提取股票数据
 */
function extractStockData(symbol, overviewData, quoteData, historyData) {
  // 检查是否有有效数据
  if (!overviewData || overviewData.Symbol !== symbol) {
    // 如果没有找到公司信息，使用基本信息
    return {
      symbol,
      name: symbol,
      description: '暂无公司信息',
      sector: '未知',
      industry: '未知',
      latestPrice: getLatestPrice(quoteData),
      changePercent: getChangePercent(quoteData),
      historicalData: extractHistoricalData(historyData)
    };
  }
  
  return {
    symbol: overviewData.Symbol,
    name: overviewData.Name || symbol,
    description: overviewData.Description || '暂无描述',
    sector: overviewData.Sector || '未知',
    industry: overviewData.Industry || '未知',
    latestPrice: getLatestPrice(quoteData),
    changePercent: getChangePercent(quoteData),
    historicalData: extractHistoricalData(historyData),
    peRatio: parseFloat(overviewData.PERatio) || null,
    dividendYield: parseFloat(overviewData.DividendYield) || 0,
    marketCap: parseFloat(overviewData.MarketCapitalization) || 0
  };
}

/**
 * 从Global Quote获取最新价格
 */
function getLatestPrice(quoteData) {
  if (quoteData && quoteData['Global Quote'] && quoteData['Global Quote']['05. price']) {
    return parseFloat(quoteData['Global Quote']['05. price']);
  }
  return null;
}

/**
 * 从Global Quote获取价格变化百分比
 */
function getChangePercent(quoteData) {
  if (quoteData && quoteData['Global Quote'] && quoteData['Global Quote']['10. change percent']) {
    const percentStr = quoteData['Global Quote']['10. change percent'];
    return parseFloat(percentStr.replace('%', ''));
  }
  return 0;
}

/**
 * 从Time Series提取历史数据
 */
function extractHistoricalData(historyData) {
  const historicalData = [];
  
  if (historyData && historyData['Time Series (Daily)']) {
    const timeSeries = historyData['Time Series (Daily)'];
    
    // 转换为数组格式，方便处理
    const dates = Object.keys(timeSeries).sort().reverse(); // 按日期升序排序
    
    for (const date of dates) {
      const dailyData = timeSeries[date];
      
      historicalData.push({
        date,
        open: parseFloat(dailyData['1. open']),
        high: parseFloat(dailyData['2. high']),
        low: parseFloat(dailyData['3. low']),
        close: parseFloat(dailyData['4. close']),
        volume: parseInt(dailyData['5. volume'], 10)
      });
    }
  }
  
  return historicalData;
}

/**
 * 分析股票历史数据和AI建议，生成推荐结果
 * @param {Array} stockDataArray 股票数据数组
 * @param {string} aiAnalysisResult 第三方AI的分析结果
 * @returns {Promise<Array>} 推荐股票数组
 */
export async function analyzeStocks(stockDataArray, aiAnalysisResult) {
  if (!stockDataArray || stockDataArray.length === 0) {
    return [];
  }
  
  // 提取AI提及的股票代码
  const aiMentionedStocks = extractMentionedStocksFromAI(aiAnalysisResult);
  
  // 对每支股票计算技术指标
  const technicalAnalysis = stockDataArray.map(stock => {
    const technicalScore = calculateTechnicalScore(stock);
    
    // 检查AI是否推荐该股票
    const aiMentionInfo = aiMentionedStocks.find(item => 
      item.symbol.toUpperCase() === stock.symbol.toUpperCase()
    );
    
    const aiScore = aiMentionInfo ? aiMentionInfo.score : 0;
    const aiReason = aiMentionInfo ? aiMentionInfo.reason : '';
    
    // 综合评分 (技术分析70%, AI推荐30%)
    const totalScore = technicalScore * 0.7 + aiScore * 0.3;
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      technicalScore,
      aiScore,
      totalScore,
      technicalReason: generateTechnicalReason(stock, technicalScore),
      aiReason,
      reason: combineReasons(generateTechnicalReason(stock, technicalScore), aiReason),
      score: totalScore
    };
  });
  
  // 按总分排序
  const sortedRecommendations = technicalAnalysis
    .sort((a, b) => b.totalScore - a.totalScore);
  
  return sortedRecommendations;
}

/**
 * 从AI分析结果中提取提及的股票
 */
function extractMentionedStocksFromAI(aiText) {
  const mentionedStocks = [];
  
  // 股票代码正则表达式 (匹配"股票代码: AAPL" 或 "推荐: AAPL" 或 "买入/卖出: AAPL"等格式)
  const symbolRegex = /(?:股票|代码|推荐|建议|买入|卖出|关注)[^\w\d]*([\w\d]{1,6})/gi;
  let match;
  
  while ((match = symbolRegex.exec(aiText)) !== null) {
    const symbol = match[1].toUpperCase();
    
    // 提取推荐原因 (尝试获取该股票附近的句子)
    const sentenceRegex = new RegExp(`[^.!?。！？]*${symbol}[^.!?。！？]*[.!?。！？]`, 'gi');
    const sentenceMatch = sentenceRegex.exec(aiText);
    const reason = sentenceMatch ? sentenceMatch[0].trim() : '人工智能推荐';
    
    // 计算AI推荐分数 (基于股票在文本中的提及次数和关键词)
    let score = 5; // 基础分数
    
    // 寻找积极词汇增加分数
    const positiveRegex = new RegExp(`(${symbol}[^.!?。！？]*(?:推荐|买入|强烈|看好|增长|上涨|机会|潜力))|((?:推荐|买入|强烈|看好|增长|上涨|机会|潜力)[^.!?。！？]*${symbol})`, 'gi');
    const positiveMatches = aiText.match(positiveRegex) || [];
    score += positiveMatches.length * 1.5;
    
    // 已经存在则合并，否则添加
    const existing = mentionedStocks.find(item => item.symbol === symbol);
    if (existing) {
      existing.score = Math.max(existing.score, score);
      if (existing.reason.length < reason.length) {
        existing.reason = reason;
      }
    } else {
      mentionedStocks.push({ symbol, reason, score });
    }
  }
  
  return mentionedStocks;
}

/**
 * 计算技术分析分数
 */
function calculateTechnicalScore(stock) {
  let score = 5; // 基础分数
  
  if (!stock.historicalData || stock.historicalData.length === 0) {
    return score;
  }
  
  // 提取近期数据
  const recentData = stock.historicalData.slice(0, 20); // 最近20个交易日
  
  // 1. 短期趋势分析
  const shortTrend = calculateTrend(recentData.slice(0, 5));
  if (shortTrend > 2) score += 2;
  else if (shortTrend > 0) score += 1;
  else if (shortTrend < -2) score -= 2;
  else if (shortTrend < 0) score -= 1;
  
  // 2. 中期趋势分析
  const mediumTrend = calculateTrend(recentData.slice(0, 10));
  if (mediumTrend > 4) score += 2;
  else if (mediumTrend > 0) score += 1;
  else if (mediumTrend < -4) score -= 2;
  else if (mediumTrend < 0) score -= 1;
  
  // 3. 成交量分析
  const volumeTrend = calculateVolumeTrend(recentData.slice(0, 5));
  if (volumeTrend > 20 && shortTrend > 0) score += 1.5; // 价格上涨+成交量增加
  else if (volumeTrend < -20 && shortTrend < 0) score -= 1.5; // 价格下跌+成交量增加
  
  // 4. 波动性分析
  const volatility = calculateVolatility(recentData.slice(0, 10));
  if (volatility < 1) score += 1; // 低波动性加分
  else if (volatility > 3) score -= 1; // 高波动性减分
  
  // 5. 基本面分析 (如果有数据)
  if (stock.peRatio !== null) {
    if (stock.peRatio > 0 && stock.peRatio < 15) score += 1; // 较低的PE比率
    else if (stock.peRatio > 40) score -= 1; // 较高的PE比率
  }
  
  if (stock.dividendYield > 3) score += 1; // 高股息率
  
  // 限制分数范围在0-10之间
  return Math.max(0, Math.min(10, score));
}

/**
 * 计算价格趋势
 */
function calculateTrend(data) {
  if (!data || data.length < 2) return 0;
  
  // 简单的计算收盘价的变化百分比
  const firstClose = data[data.length - 1].close;
  const lastClose = data[0].close;
  
  return ((lastClose - firstClose) / firstClose) * 100;
}

/**
 * 计算成交量趋势
 */
function calculateVolumeTrend(data) {
  if (!data || data.length < 2) return 0;
  
  // 计算平均成交量变化百分比
  const firstVolume = data[data.length - 1].volume;
  const lastVolume = data[0].volume;
  
  return ((lastVolume - firstVolume) / firstVolume) * 100;
}

/**
 * 计算股价波动性
 */
function calculateVolatility(data) {
  if (!data || data.length < 2) return 0;
  
  // 计算日涨跌幅的标准差
  const dailyChanges = [];
  
  for (let i = 1; i < data.length; i++) {
    const pctChange = ((data[i-1].close - data[i].close) / data[i].close) * 100;
    dailyChanges.push(pctChange);
  }
  
  const avgChange = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;
  
  const sumSquaredDiff = dailyChanges.reduce((sum, change) => {
    const diff = change - avgChange;
    return sum + diff * diff;
  }, 0);
  
  return Math.sqrt(sumSquaredDiff / dailyChanges.length);
}

/**
 * 根据技术分析生成推荐理由
 */
function generateTechnicalReason(stock, score) {
  const reasons = [];
  
  if (!stock.historicalData || stock.historicalData.length === 0) {
    return '暂无足够历史数据进行分析';
  }
  
  // 提取近期数据
  const recentData = stock.historicalData.slice(0, 20);
  
  // 短期趋势
  const shortTrend = calculateTrend(recentData.slice(0, 5));
  if (shortTrend > 2) {
    reasons.push(`近5个交易日上涨${shortTrend.toFixed(2)}%`);
  } else if (shortTrend < -2) {
    reasons.push(`近5个交易日下跌${Math.abs(shortTrend).toFixed(2)}%`);
  }
  
  // 中期趋势
  const mediumTrend = calculateTrend(recentData.slice(0, 10));
  if (mediumTrend > 4) {
    reasons.push(`近10个交易日上涨${mediumTrend.toFixed(2)}%`);
  } else if (mediumTrend < -4) {
    reasons.push(`近10个交易日下跌${Math.abs(mediumTrend).toFixed(2)}%`);
  }
  
  // 成交量变化
  const volumeTrend = calculateVolumeTrend(recentData.slice(0, 5));
  if (volumeTrend > 20 && shortTrend > 0) {
    reasons.push('成交量增加且价格上涨，表明买盘活跃');
  } else if (volumeTrend < -20 && shortTrend < 0) {
    reasons.push('成交量减少且价格下跌，表明卖压较大');
  }
  
  // 基本面分析
  if (stock.peRatio !== null) {
    if (stock.peRatio > 0 && stock.peRatio < 15) {
      reasons.push(`PE比率(${stock.peRatio.toFixed(2)})处于较低水平，可能被低估`);
    } else if (stock.peRatio > 40) {
      reasons.push(`PE比率(${stock.peRatio.toFixed(2)})较高，存在高估风险`);
    }
  }
  
  if (stock.dividendYield > 3) {
    reasons.push(`股息率(${stock.dividendYield.toFixed(2)}%)较高，适合收息投资`);
  }
  
  // 总结
  if (score >= 8) {
    reasons.unshift('技术分析显示强烈买入信号');
  } else if (score >= 6) {
    reasons.unshift('技术分析显示买入信号');
  } else if (score <= 3) {
    reasons.unshift('技术分析显示卖出信号');
  } else if (score <= 4) {
    reasons.unshift('技术分析显示观望信号');
  } else {
    reasons.unshift('技术分析显示中性信号');
  }
  
  return reasons.join('，');
}

/**
 * 组合技术分析和AI分析的理由
 */
function combineReasons(technicalReason, aiReason) {
  if (!aiReason) return technicalReason;
  if (!technicalReason) return aiReason;
  
  return `${technicalReason}；${aiReason}`;
} 