-- 创建健身目标主表
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_name TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    total_weeks INT NOT NULL,
    start_weight NUMERIC(4,1) NOT NULL, -- 起始体重（斤）
    target_weight NUMERIC(4,1) NOT NULL, -- 目标体重（斤）
    weekly_goal NUMERIC(3,2) NOT NULL, -- 每周目标（斤）
    goal_description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建健身活动子表
CREATE TABLE IF NOT EXISTS fitness_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES fitness_goals(id),
    week_number INT NOT NULL CHECK (week_number > 0),
    activity_date DATE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('饮食', '锻炼', '体重记录')),
    display_order INT NOT NULL DEFAULT 0, -- 添加显示顺序字段
    
    -- 饮食相关字段
    meal_type TEXT CHECK (
        meal_type IN ('早餐', '上午加餐', '午餐', '下午加餐', '晚餐')
    ),
    meal_description TEXT,
    meal_calories INT CHECK (meal_calories > 0),
    
    -- 锻炼相关字段
    exercise_name TEXT,
    exercise_category TEXT CHECK (
        exercise_category IN ('有氧运动', '力量训练', '柔韧性训练', '恢复训练')
    ),
    exercise_duration_minutes INT,
    exercise_sets INT,
    exercise_reps TEXT,
    exercise_weight_kg NUMERIC(4,1),
    exercise_distance_km NUMERIC(4,2),
    exercise_calories_burned INT,
    
    -- 体重记录相关字段
    weight_record NUMERIC(4,1),
    
    -- 通用字段
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 约束
    CONSTRAINT valid_meal_fields CHECK (
        (entry_type = '饮食' AND meal_type IS NOT NULL AND meal_description IS NOT NULL AND meal_calories IS NOT NULL) OR
        (entry_type != '饮食')
    ),
    CONSTRAINT valid_exercise_fields CHECK (
        (entry_type = '锻炼' AND exercise_name IS NOT NULL AND exercise_category IS NOT NULL) OR
        (entry_type != '锻炼')
    ),
    CONSTRAINT valid_weight_fields CHECK (
        (entry_type = '体重记录' AND weight_record IS NOT NULL) OR
        (entry_type != '体重记录')
    )
);

-- 创建索引
CREATE INDEX idx_activities_goal_id ON fitness_activities(goal_id);
CREATE INDEX idx_activities_date ON fitness_activities(activity_date);
CREATE INDEX idx_activities_week ON fitness_activities(goal_id, week_number);

-- 创建触发器函数来自动更新更新时间
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为两张表添加自动更新触发器
CREATE TRIGGER update_fitness_goals_updated_at
    BEFORE UPDATE ON fitness_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_activities_updated_at
    BEFORE UPDATE ON fitness_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE fitness_goals IS '健身目标主表，记录用户的减重目标信息';
COMMENT ON TABLE fitness_activities IS '健身活动表，记录每日的饮食、运动和体重数据'; 