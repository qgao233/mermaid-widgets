-- 创建外链工具表
CREATE TABLE external_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入外链工具数据
INSERT INTO external_tools (name, url, icon, sort_order) VALUES
('Cron表达式生成器', 'https://cron.ciding.cc/', '⏱️', 1),
('代码高亮工具', 'https://highlightcode.com/', '✨', 2),
('图片转线描', 'https://online.rapidresizer.com/photograph-to-pattern.php', '✏️', 3),
('在线编译工具', 'https://www.json.cn/run/', '▶️', 4),
('英文花体字转换器', 'https://www.akuziti.com/yw/huati.php', '𝓐', 5),
('保持屏幕常亮', 'https://www.keepscreenon.com/', '💡', 6),
('画SVG', 'https://mavo.io/demos/svgpath/', '🖋️', 7),
('HTML转Markdown', 'https://devtool.tech/html-md', '📝', 8),
('自动抠图', 'https://www.koukoutu.com/removebgtool/all', '✂️', 9),
('PDF转JPG', 'https://www.pdfconvertonline.com/cn/pdf-to-jpg/', '🔄', 10),
('在线钢琴模拟器', 'https://www.xiwnn.com/piano/', '🎹', 11);

-- 创建索引
CREATE INDEX idx_external_tools_sort_order ON external_tools(sort_order);