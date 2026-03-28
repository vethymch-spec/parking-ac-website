-- CoolDrivePro Database Seed Data
-- Run this AFTER pnpm db:push to restore initial data
-- Generated from Manus export on 2026-03-22

-- Users (1 admin account)
INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn, avatar, bio, location, vehicleType)
VALUES (1, '3PBG8YatGfTbesi4TKnd4z', 'Reina', 'cassandraramirez1689@outlook.com', 'email', 'admin', '2026-03-21 13:54:17', '2026-03-21 17:56:33', '2026-03-21 17:56:34', NULL, NULL, NULL, NULL);

-- Forum Categories (7 categories)
INSERT INTO forum_categories (id, name, slug, description, icon, color, sortOrder, postCount, createdAt) VALUES
(1, 'Experience & Reviews', 'experience-reviews', 'Share your real-world experience with parking AC systems', 'star', '#f59e0b', 1, 0, '2026-03-21 13:52:32'),
(2, 'Installation Help', 'installation-help', 'Questions and tips on installing your parking AC', 'wrench', '#3b82f6', 2, 0, '2026-03-21 13:52:32'),
(3, 'Troubleshooting', 'troubleshooting', 'Get help diagnosing and fixing issues', 'alert-triangle', '#ef4444', 3, 0, '2026-03-21 13:52:32'),
(4, 'Solar & Battery Setup', 'solar-battery', 'Discuss solar panels, battery banks, and power systems', 'zap', '#10b981', 4, 0, '2026-03-21 13:52:32'),
(5, 'Van Life & RV Living', 'van-life-rv', 'Life on the road, van builds, and RV tips', 'truck', '#8b5cf6', 5, 0, '2026-03-21 13:52:32'),
(6, 'Product Comparison', 'product-comparison', 'Compare different parking AC models and brands', 'bar-chart', '#06b6d4', 6, 0, '2026-03-21 13:52:32'),
(7, 'General Discussion', 'general', 'Anything else related to parking air conditioning', 'message-circle', '#6b7280', 7, 0, '2026-03-21 13:52:32');
