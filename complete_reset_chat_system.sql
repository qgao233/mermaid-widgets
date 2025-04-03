-- 完整重置和重建聊天系统的SQL脚本
-- 此脚本会删除所有现有的表、策略、触发器等，并重新创建它们

-- 步骤1: 手动删除所有已知策略
DROP POLICY IF EXISTS "anyone_can_view_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;

DROP POLICY IF EXISTS "Select chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "users_can_view_own_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "users_can_view_joined_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "users_can_create_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "creators_can_update_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "auth_select_created_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "auth_select_joined_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "auth_insert_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "auth_update_own_rooms" ON chat_rooms;

DROP POLICY IF EXISTS "users_can_view_own_memberships" ON chat_room_members;
DROP POLICY IF EXISTS "creators_can_view_room_members" ON chat_room_members;
DROP POLICY IF EXISTS "members_can_view_other_members" ON chat_room_members;
DROP POLICY IF EXISTS "creators_can_add_members" ON chat_room_members;
DROP POLICY IF EXISTS "creators_can_remove_members" ON chat_room_members;

DROP POLICY IF EXISTS "members_can_view_messages" ON private_messages;
DROP POLICY IF EXISTS "members_can_send_messages" ON private_messages;

-- 删除旧的策略命名
DROP POLICY IF EXISTS "Chat rooms are viewable by members" ON chat_rooms;
DROP POLICY IF EXISTS "Anyone can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Owners can update chat rooms" ON chat_rooms;

DROP POLICY IF EXISTS "Members are viewable by room members" ON chat_room_members;
DROP POLICY IF EXISTS "Room owners can add members" ON chat_room_members;

DROP POLICY IF EXISTS "Messages are viewable by room members" ON private_messages;
DROP POLICY IF EXISTS "Room members can insert messages" ON private_messages;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "View self memberships" ON chat_room_members;
DROP POLICY IF EXISTS "View own room members" ON chat_room_members;
DROP POLICY IF EXISTS "Add members to own rooms" ON chat_room_members;
DROP POLICY IF EXISTS "Remove members from own rooms" ON chat_room_members;

DROP POLICY IF EXISTS "Temporary public access" ON chat_rooms;
DROP POLICY IF EXISTS "Temporary public access" ON chat_room_members;
DROP POLICY IF EXISTS "Temporary public access" ON private_messages;

-- 临时禁用所有表的RLS以防止删除时的依赖问题
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 步骤2: 删除触发器和函数
DROP TRIGGER IF EXISTS on_new_private_message ON private_messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_private_message();
DROP FUNCTION IF EXISTS create_profile_for_user();
DROP FUNCTION IF EXISTS is_room_member(); -- 删除可能存在的辅助函数

-- 步骤3: 删除所有表 (使用CASCADE选项以确保所有依赖对象都被删除)
DROP TABLE IF EXISTS private_messages CASCADE;
DROP TABLE IF EXISTS chat_room_members CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 步骤4: 重新创建表

-- 用户资料表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天室表
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天室成员表
CREATE TABLE chat_room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 私聊消息表
CREATE TABLE private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 步骤5: 创建函数和触发器

-- 当新消息创建时更新聊天室的最后活动时间
CREATE OR REPLACE FUNCTION handle_new_private_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms SET updated_at = NOW() WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 当用户创建时自动创建资料
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建辅助函数来检查用户是否是聊天室的成员，避免递归查询
CREATE OR REPLACE FUNCTION is_room_member(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_member BOOLEAN;
BEGIN
  -- 检查用户是否是聊天室的创建者
  SELECT EXISTS(
    SELECT 1 FROM chat_rooms 
    WHERE id = room_uuid AND created_by = user_uuid
  ) INTO is_member;
  
  -- 如果不是创建者，检查是否是成员
  IF NOT is_member THEN
    SELECT EXISTS(
      SELECT 1 FROM chat_room_members
      WHERE room_id = room_uuid AND user_id = user_uuid
    ) INTO is_member;
  END IF;
  
  RETURN is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_new_private_message
  AFTER INSERT ON private_messages
  FOR EACH ROW EXECUTE FUNCTION handle_new_private_message();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- 步骤6: 启用RLS并创建安全策略

-- 分别为各表创建简单明确的策略

-- profiles表策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_view_profiles" ON profiles 
  FOR SELECT USING (true);
CREATE POLICY "users_can_update_own_profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- chat_rooms表策略
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
-- 用户可以查看自己创建的聊天室
CREATE POLICY "users_can_view_own_rooms" ON chat_rooms 
  FOR SELECT USING (created_by = auth.uid());
-- 用户可以查看自己加入的聊天室 - 使用辅助函数避免递归
CREATE POLICY "users_can_view_joined_rooms" ON chat_rooms 
  FOR SELECT USING (
    is_room_member(id, auth.uid())
  );
-- 登录用户可以创建聊天室
CREATE POLICY "users_can_create_rooms" ON chat_rooms 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- 创建者可以更新聊天室
CREATE POLICY "creators_can_update_rooms" ON chat_rooms 
  FOR UPDATE USING (created_by = auth.uid());

-- chat_room_members表策略
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

-- 简化策略，避免递归引用
-- 1. 用户可以查看自己的成员身份
CREATE POLICY "users_can_view_own_memberships" ON chat_room_members 
  FOR SELECT USING (user_id = auth.uid());

-- 2. 创建者可以查看自己创建的聊天室的所有成员
CREATE POLICY "creators_can_view_room_members" ON chat_room_members 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_room_members.room_id 
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- 3. 用户可以查看自己所在聊天室的其他成员 - 简化避免递归
CREATE POLICY "members_can_view_other_members" ON chat_room_members 
  FOR SELECT USING (
    -- 使用辅助函数检查
    user_id != auth.uid() AND 
    is_room_member(room_id, auth.uid())
  );

-- 4. 创建者可以添加成员
CREATE POLICY "creators_can_add_members" ON chat_room_members 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_room_members.room_id 
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- 5. 创建者可以移除成员
CREATE POLICY "creators_can_remove_members" ON chat_room_members 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_room_members.room_id 
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- private_messages表策略
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
-- 成员可以查看聊天室的消息 - 使用辅助函数避免递归
CREATE POLICY "members_can_view_messages" ON private_messages 
  FOR SELECT USING (
    is_room_member(room_id, auth.uid())
  );
-- 成员可以发送消息 - 使用辅助函数避免递归
CREATE POLICY "members_can_send_messages" ON private_messages 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    is_room_member(room_id, auth.uid())
  ); 