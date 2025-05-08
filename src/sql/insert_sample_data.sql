-- 插入健身目标
INSERT INTO fitness_goals (
    goal_name,
    start_date,
    end_date,
    total_weeks,
    start_weight,
    target_weight,
    weekly_goal,
    goal_description,
    status
) VALUES (
    '160斤减重计划',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '16 weeks',
    16,
    160.0,
    140.0,
    1.25,
    '目标：16周通过科学饮食和渐进式运动减重20斤。每日摄入2000-2200卡路里，每周运动4-5次，每周目标减重1.25斤。计划特点：1. 适合中国人的饮食习惯 2. 循序渐进的运动强度 3. 可持续的生活方式改变',
    'active'
);

-- 获取刚插入的目标ID
DO $$
DECLARE
    v_goal_id UUID;
    v_current_date DATE;
    v_week INT;
    v_day INT;
BEGIN
    SELECT id INTO v_goal_id FROM fitness_goals WHERE goal_name = '160斤减重计划';
    
    -- 循环插入16周的数据
    FOR v_week IN 1..16 LOOP
        -- 每周7天
        FOR v_day IN 1..7 LOOP
            v_current_date := CURRENT_DATE + ((v_week - 1) * 7 + v_day - 1) * INTERVAL '1 day';
            
            -- 插入饮食计划
            INSERT INTO fitness_activities (
                goal_id,
                week_number,
                activity_date,
                day_of_week,
                entry_type,
                display_order,
                meal_type,
                meal_description,
                meal_calories,
                notes
            ) VALUES
            -- 早餐 (500-600卡路里)
            (v_goal_id, v_week, v_current_date, v_day, '饮食', 10, '早餐',
             CASE v_day
                WHEN 1 THEN '1碗燕麦粥(100g干重,345卡) + 2个煮鸡蛋(140卡) + 低脂牛奶200ml(80卡) + 1个苹果(52卡)'
                WHEN 2 THEN '全麦面包2片(180卡) + 1个煎蛋(90卡) + 低脂牛奶200ml(80卡) + 1根香蕉(120卡)'
                WHEN 3 THEN '1碗杂粮粥(300卡) + 1个水煮蛋(70卡) + 蒸南瓜100g(80卡) + 原味酸奶(120卡)'
                WHEN 4 THEN '红薯粥(250卡) + 鸡胸肉100g(165卡) + 西红柿(30卡) + 低脂牛奶200ml(80卡)'
                WHEN 5 THEN '黑米粥(280卡) + 1个煎蛋(90卡) + 玉米棒(150卡) + 原味酸奶(120卡)'
                WHEN 6 THEN '小米粥(260卡) + 1个水煮蛋(70卡) + 蒸红薯150g(130卡) + 低脂牛奶200ml(80卡)'
                ELSE '麦片50g(180卡) + 低脂牛奶250ml(100卡) + 1个鸡蛋(70卡) + 1个橙子(70卡)'
             END,
             CASE v_day
                WHEN 1 THEN 617
                WHEN 2 THEN 570
                WHEN 3 THEN 570
                WHEN 4 THEN 525
                WHEN 5 THEN 640
                WHEN 6 THEN 540
                ELSE 420
             END,
             '早餐摄入充足蛋白质和碳水，保证上午能量供应'),
            
            -- 上午加餐
            (v_goal_id, v_week, v_current_date, v_day, '饮食', 20, '上午加餐',
             CASE v_day
                WHEN 1 THEN '1个苹果(52卡) + 10粒杏仁(140卡)'
                WHEN 2 THEN '1根香蕉(120卡) + 无糖豆浆200ml(80卡)'
                WHEN 3 THEN '1个橙子(70卡) + 煮毛豆100g(120卡)'
                WHEN 4 THEN '酸奶200g(120卡) + 蓝莓50g(80卡)'
                WHEN 5 THEN '1个梨(60卡) + 无调味坚果30g(140卡)'
                WHEN 6 THEN '1个柚子(80卡) + 无糖豆浆200ml(80卡)'
                ELSE '1个苹果(52卡) + 原味酸奶(120卡)'
             END,
             CASE v_day
                WHEN 1 THEN 192
                WHEN 2 THEN 200
                WHEN 3 THEN 190
                WHEN 4 THEN 200
                WHEN 5 THEN 200
                WHEN 6 THEN 160
                ELSE 172
             END,
             '适量加餐避免饥饿，选择低GI水果和坚果'),
            
            -- 午餐 (600-700卡路里)
            (v_goal_id, v_week, v_current_date, v_day, '饮食', 30, '午餐',
             CASE v_day
                WHEN 1 THEN '糙米饭150g(200卡) + 清炒西兰花200g(70卡) + 清蒸鸡胸肉150g(248卡) + 番茄蛋汤(150卡)'
                WHEN 2 THEN '燕麦饭150g(180卡) + 炒青菜200g(60卡) + 水煮牛肉100g(290卡) + 紫菜汤(50卡)'
                WHEN 3 THEN '糙米饭150g(200卡) + 炒菜心200g(60卡) + 清蒸鲈鱼150g(240卡) + 萝卜汤(60卡)'
                WHEN 4 THEN '藜麦饭150g(180卡) + 炒豆芽200g(50卡) + 蒸虾仁150g(270卡) + 海带汤(40卡)'
                WHEN 5 THEN '糙米饭150g(200卡) + 炒空心菜200g(60卡) + 清蒸鸡胸150g(248卡) + 冬瓜汤(40卡)'
                WHEN 6 THEN '燕麦饭150g(180卡) + 炒韭菜200g(70卡) + 水煮牛肉100g(290卡) + 蘑菇汤(60卡)'
                ELSE '糙米饭150g(200卡) + 炒青菜200g(60卡) + 清蒸鲈鱼150g(240卡) + 蔬菜汤(50卡)'
             END,
             CASE v_day
                WHEN 1 THEN 668
                WHEN 2 THEN 580
                WHEN 3 THEN 560
                WHEN 4 THEN 540
                WHEN 5 THEN 548
                WHEN 6 THEN 600
                ELSE 550
             END,
             '午餐保证主食量，搭配优质蛋白，注意蔬菜多样性'),
            
            -- 下午加餐
            (v_goal_id, v_week, v_current_date, v_day, '饮食', 40, '下午加餐',
             CASE v_day
                WHEN 1 THEN '1个苹果(52卡) + 10粒杏仁(140卡)'
                WHEN 2 THEN '1根香蕉(120卡) + 无糖豆浆200ml(80卡)'
                WHEN 3 THEN '1个橙子(70卡) + 煮毛豆100g(120卡)'
                WHEN 4 THEN '酸奶200g(120卡) + 蓝莓50g(80卡)'
                WHEN 5 THEN '1个梨(60卡) + 无调味坚果30g(140卡)'
                WHEN 6 THEN '1个柚子(80卡) + 无糖豆浆200ml(80卡)'
                ELSE '1个苹果(52卡) + 原味酸奶(120卡)'
             END,
             CASE v_day
                WHEN 1 THEN 192
                WHEN 2 THEN 200
                WHEN 3 THEN 190
                WHEN 4 THEN 200
                WHEN 5 THEN 200
                WHEN 6 THEN 160
                ELSE 172
             END,
             '适量加餐避免饥饿，选择低GI水果和坚果'),
            
            -- 晚餐 (500-600卡路里)
            (v_goal_id, v_week, v_current_date, v_day, '饮食', 50, '晚餐',
             CASE v_day
                WHEN 1 THEN '魔芋面条200g(40卡) + 清炒菜心200g(60卡) + 水煮虾仁150g(270卡) + 蒸蛋(100卡)'
                WHEN 2 THEN '豆腐皮100g(100卡) + 炒青菜200g(60卡) + 蒸鸡胸肉150g(248卡) + 紫菜汤(50卡)'
                WHEN 3 THEN '魔芋粉丝200g(40卡) + 炒韭菜200g(70卡) + 水煮鱼片200g(260卡) + 番茄蛋汤(150卡)'
                WHEN 4 THEN '内酯豆腐200g(160卡) + 炒空心菜200g(60卡) + 蒸虾仁150g(270卡)'
                WHEN 5 THEN '魔芋面200g(40卡) + 炒菜心200g(60卡) + 水煮牛肉100g(290卡) + 萝卜汤(60卡)'
                WHEN 6 THEN '豆腐皮100g(100卡) + 炒西兰花200g(70卡) + 蒸鸡胸肉150g(248卡) + 蘑菇汤(60卡)'
                ELSE '魔芋粉丝200g(40卡) + 炒青菜200g(60卡) + 水煮虾仁150g(270卡) + 紫菜汤(50卡)'
             END,
             CASE v_day
                WHEN 1 THEN 470
                WHEN 2 THEN 458
                WHEN 3 THEN 520
                WHEN 4 THEN 490
                WHEN 5 THEN 450
                WHEN 6 THEN 478
                ELSE 420
             END,
             '晚餐控制碳水，以优质蛋白为主，搭配充足蔬菜');

            -- 插入运动计划
            -- 前4周：适应期
            IF v_week <= 4 THEN
                IF v_day IN (1, 3, 5) THEN  -- 周一、三、五：基础有氧
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, display_order, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_distance_km,
                        exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼', 60,
                     CASE v_day
                        WHEN 1 THEN '快走'
                        WHEN 3 THEN '快走'
                        WHEN 5 THEN '椭圆机'
                     END,
                     '有氧运动',
                     30,
                     CASE v_day
                        WHEN 1 THEN 2.5
                        WHEN 3 THEN 2.5
                        ELSE NULL
                     END,
                     180,
                     '保持心率在110-120之间，以能正常交谈为准。新手先适应有氧运动。');
                END IF;

                IF v_day IN (2, 4) THEN  -- 周二、四：基础力量
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, display_order, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_sets, exercise_reps,
                        exercise_weight_kg, exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼', 70,
                     CASE v_day
                        WHEN 2 THEN '哑铃弯举'
                        ELSE '深蹲'
                     END,
                     '力量训练',
                     20,
                     2,
                     '10次',
                     CASE v_day
                        WHEN 2 THEN 2.0
                        ELSE NULL
                     END,
                     100,
                     '新手先练习标准动作，重量从轻开始，注意热身。');
                END IF;
            END IF;

            -- 5-8周：进阶期
            IF v_week BETWEEN 5 AND 8 THEN
                IF v_day IN (1, 3, 5) THEN  -- 周一、三、五：进阶有氧
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_distance_km,
                        exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                     CASE v_day
                        WHEN 1 THEN '快走'
                        WHEN 3 THEN '慢跑'
                        WHEN 5 THEN '游泳'
                     END,
                     '有氧运动',
                     40,
                     CASE v_day
                        WHEN 1 THEN 3.5
                        WHEN 3 THEN 4.0
                        ELSE NULL
                     END,
                     CASE v_day
                        WHEN 1 THEN 240
                        WHEN 3 THEN 280
                        WHEN 5 THEN 260
                     END,
                     '心率控制在120-130之间，可以稍微喘，但还能说完整句子。');
                END IF;

                IF v_day IN (2, 4, 6) THEN  -- 周二、四、六：进阶力量
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_sets, exercise_reps,
                        exercise_weight_kg, exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                     CASE v_day
                        WHEN 2 THEN '哑铃弯举'
                        WHEN 4 THEN '深蹲'
                        ELSE '平板支撑'
                     END,
                     '力量训练',
                     30,
                     3,
                     CASE v_day
                        WHEN 2 THEN '12次'
                        WHEN 4 THEN '15次'
                        ELSE '30秒'
                     END,
                     CASE v_day
                        WHEN 2 THEN 3.0
                        WHEN 4 THEN NULL
                        ELSE NULL
                     END,
                     150,
                     '增加训练量和强度，注意动作标准性。');
                END IF;
            END IF;

            -- 9-12周：强化期
            IF v_week BETWEEN 9 AND 12 THEN
                IF v_day IN (1, 3, 5) THEN  -- 周一、三、五：强化有氧
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_distance_km,
                        exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                     CASE v_day
                        WHEN 1 THEN '快走+慢跑间歇'
                        WHEN 3 THEN '慢跑'
                        WHEN 5 THEN '游泳'
                     END,
                     '有氧运动',
                     50,
                     CASE v_day
                        WHEN 1 THEN 5.0
                        WHEN 3 THEN 5.0
                        ELSE NULL
                     END,
                     CASE v_day
                        WHEN 1 THEN 350
                        WHEN 3 THEN 350
                        WHEN 5 THEN 300
                     END,
                     '开始加入间歇训练，提高心肺功能。心率可达到130-140。');
                END IF;

                IF v_day IN (2, 4, 6) THEN  -- 周二、四、六：强化力量
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_sets, exercise_reps,
                        exercise_weight_kg, exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                     CASE v_day
                        WHEN 2 THEN '哑铃弯举'
                        WHEN 4 THEN '深蹲'
                        ELSE '平板支撑'
                     END,
                     '力量训练',
                     40,
                     4,
                     CASE v_day
                        WHEN 2 THEN '15次'
                        WHEN 4 THEN '20次'
                        ELSE '45秒'
                     END,
                     CASE v_day
                        WHEN 2 THEN 4.0
                        WHEN 4 THEN NULL
                        ELSE NULL
                     END,
                     200,
                     '增加组数和重量，注意动作标准性和呼吸节奏。');
                END IF;
            END IF;

            -- 13-16周：维持期
            IF v_week BETWEEN 13 AND 16 THEN
                IF v_day IN (1, 3, 5) THEN  -- 周一、三、五：维持有氧
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_distance_km,
                        exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                     CASE v_day
                        WHEN 1 THEN '快走+慢跑间歇'
                        WHEN 3 THEN '慢跑'
                        WHEN 5 THEN '游泳或自行车'
                     END,
                     '有氧运动',
                     60,
                     CASE v_day
                        WHEN 1 THEN 6.0
                        WHEN 3 THEN 6.0
                        ELSE NULL
                     END,
                     CASE v_day
                        WHEN 1 THEN 400
                        WHEN 3 THEN 400
                        WHEN 5 THEN 350
                     END,
                     '保持训练强度，注意运动形式多样化，避免运动倦怠。');
                END IF;

                IF v_day IN (2, 4, 6) THEN  -- 周二、四、六：维持力量
                    INSERT INTO fitness_activities (
                        goal_id, week_number, activity_date, day_of_week,
                        entry_type, exercise_name, exercise_category,
                        exercise_duration_minutes, exercise_sets, exercise_reps,
                        exercise_weight_kg, exercise_calories_burned, notes
                    ) VALUES
                    (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                     CASE v_day
                        WHEN 2 THEN '综合力量训练'
                        WHEN 4 THEN '核心训练'
                        ELSE '柔韧性训练'
                     END,
                     '力量训练',
                     45,
                     4,
                     CASE v_day
                        WHEN 2 THEN '15次'
                        WHEN 4 THEN '20次'
                        ELSE '60秒'
                     END,
                     CASE v_day
                        WHEN 2 THEN 5.0
                        ELSE NULL
                     END,
                     250,
                     '保持训练质量，注意身体反馈，适时调整训练强度。');
                END IF;
            END IF;

            -- 每周日：恢复训练
            IF v_day = 7 THEN
                INSERT INTO fitness_activities (
                    goal_id, week_number, activity_date, day_of_week,
                    entry_type, exercise_name, exercise_category,
                    exercise_duration_minutes, notes
                ) VALUES
                (v_goal_id, v_week, v_current_date, v_day, '锻炼',
                 CASE 
                    WHEN v_week <= 4 THEN '轻度拉伸'
                    WHEN v_week <= 8 THEN '瑜伽基础'
                    WHEN v_week <= 12 THEN '瑜伽流动'
                    ELSE '瑜伽+冥想'
                 END,
                 '恢复训练',
                 CASE 
                    WHEN v_week <= 4 THEN 20
                    WHEN v_week <= 8 THEN 30
                    WHEN v_week <= 12 THEN 40
                    ELSE 45
                 END,
                 CASE 
                    WHEN v_week <= 4 THEN '进行全身轻度拉伸，促进血液循环'
                    WHEN v_week <= 8 THEN '练习基础瑜伽体式，提高柔韧性'
                    WHEN v_week <= 12 THEN '进行流动瑜伽练习，加强身心平衡'
                    ELSE '结合瑜伽和冥想，促进身心恢复'
                 END);
            END IF;
        END LOOP;
    END LOOP;
END $$; 