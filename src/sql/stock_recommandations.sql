-- 创建股票推荐表
CREATE TABLE IF NOT EXISTS stock_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendations JSONB NOT NULL, -- 推荐的股票数组，包括股票代码、名称、推荐理由和得分
    news_context TEXT, -- 推荐时的新闻上下文
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为stock_recommendations表添加RLS策略
ALTER TABLE stock_recommendations ENABLE ROW LEVEL SECURITY;

-- 读取权限：所有已认证用户可读
CREATE POLICY "所有已认证用户可读取股票推荐" ON stock_recommendations
    FOR SELECT USING (auth.role() = 'authenticated');

-- 写入权限：所有已认证用户可添加
CREATE POLICY "所有已认证用户可添加股票推荐" ON stock_recommendations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 创建触发器函数，自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，当记录更新时更新updated_at字段
CREATE TRIGGER update_stock_recommendations_updated_at
BEFORE UPDATE ON stock_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 