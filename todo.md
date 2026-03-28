# CoolDrivePro Website TODO

## Completed Features
- [x] Homepage with hero, products, features, FAQ, blog sections
- [x] VS02 PRO top-mounted AC product page with specs and 65 reviews
- [x] VX3000SP mini-split AC product page with specs and 65 reviews
- [x] 50 SEO blog articles (2500+ words each, 12 categories)
- [x] Blog listing page with category filtering, search, pagination
- [x] About Us page with partner network (vethy.com)
- [x] Contact Us page with EmailJS integration
- [x] Policy pages (warranty, return, shipping, privacy)
- [x] WhatsApp floating button (+86 153 1425 2983)
- [x] Navigation restructured (Forum, Blog in header; policies in footer)
- [x] Google Search Console verified, sitemap.xml submitted (66 URLs)
- [x] GEO optimization: FAQ schema, brand knowledge page, structured data
- [x] robots.txt with AI crawler permissions
- [x] useSEO hook with canonical tags site-wide
- [x] External link to vethy.com in About Us

## Forum Feature (Current Sprint)
- [x] Upgrade project to full-stack (database + user auth)
- [x] Design forum database schema (categories, posts, replies, likes)
- [x] Push database migrations
- [x] Create forum tRPC API routes (getCategories, getPosts, createPost, createReply, likePost, likeReply, updateProfile)
- [x] Forum listing page (/forum) with category sidebar, search, post list
- [x] New post page (/forum/new-post) with form validation
- [x] Post detail page (/forum/post/:slug) with replies and like buttons
- [x] Add Forum link to Navbar and Footer
- [x] Add forum SEO meta tags to useSEO hook
- [x] Write and pass vitest tests for forum router

## Pending / Future
- [ ] Add real product pricing to product pages
- [ ] Replace placeholder product images with real photos
- [ ] Complete Heater product pages
- [ ] Add Related Articles to blog posts
- [ ] Integrate Google Analytics 4
- [ ] User profile page (/forum/profile)
- [ ] Forum admin moderation panel
- [ ] Email notifications for forum replies
- [ ] Forum sitemap entries for SEO

## After-Sales Ticket System (Current Sprint)
- [x] Design ticket database schema (tickets, ticket_messages, ticket_attachments)
- [x] Push database migrations
- [x] Backend API: submit ticket, upload files to S3, admin list/review/reply, email notification
- [x] Customer ticket submission page (step-by-step wizard: error code → description → upload → confirm)
- [x] Customer ticket status page (view ticket history and admin replies)
- [x] Admin dashboard: ticket list with filters, ticket detail, reply form
- [x] Email notification when admin replies (using built-in notification or EmailJS)
- [x] Write vitest tests for ticket router

## Customer Account System (Completed)
- [x] Customer accounts table: customerNo, passwordHash, email, contactName, companyName, phone, customerType, status, loginFailCount, lockedUntil, mustChangePassword, passwordChanged, lastLoginAt, firstLoginAt, passwordResetAt, createdBy, adminNotes, productModel, orderNumber, purchaseDate
- [x] customerLogs table: customerId, action, description, ipAddress, createdAt
- [x] Push database migration
- [x] Backend: admin creates customer by email → auto-generate CDP-C-YYYY-NNNN + activation token → send activation email
- [x] Backend: customer activates account via email link (sets password)
- [x] Backend: customer login with email+password (account lock after 5 failures, 30min)
- [x] Backend: customer logout
- [x] Backend: customer change password (mustChangePassword enforcement)
- [x] Backend: forgot password (send reset link via email)
- [x] Backend: reset password via token
- [x] Backend: admin suspend/reactivate/resend activation/update info/get logs
- [x] Customer login page /support/login
- [x] Customer activation page /support/activate (set password via email link)
- [x] Customer change password page /support/change-password (forced on first login)
- [x] Customer forgot password page /support/forgot-password
- [x] Customer reset password page /support/reset-password
- [x] Customer portal /support/portal (view own tickets, submit new ticket)
- [x] Admin customer management page /admin/customers (list, create, suspend, reactivate, resend, view logs)
- [x] All routes registered in App.tsx

## Ticket Access Control (Current Sprint)
- [x] Block /support/submit for unauthenticated customers (redirect to /support/login)
- [x] Update Support.tsx to show only Customer Portal Login as the primary CTA (removed public submit button)
- [x] Support.tsx hero and bottom CTA now both point to /support/login only

## Real Email Delivery (Resend Integration)
- [x] Install resend npm package
- [x] Add RESEND_API_KEY secret (configured in project secrets)
- [x] Create server/email.ts helper with sendCustomerWelcomeEmail() and sendPasswordResetEmail() functions
- [x] Update customer router: generate plaintext initial password, send via Resend to customer email
- [x] Update forgot-password flow to also use Resend (sendPasswordResetEmail)
- [x] Fix esbuild syntax error: removed old sendActivationEmail function from customer.ts
- [x] Test and save checkpoint

## Navigation & Access Fixes (Completed)
- [x] Add admin panel entry in Navbar (visible only to logged-in admin users via Manus OAuth)
- [x] Add Customer Portal login button in Navbar (always visible in user dropdown)
- [x] Update Support page to clearly explain how customers get an account and how to login
- [x] Verify /admin/customers and /admin/tickets are accessible after admin login
- [x] Navbar user icon shows dropdown with Admin section (Ticket Management, Customer Management) and Customer section (Customer Portal Login / My Support Portal)

## Admin Independent Login (Completed)
- [x] Create /admin/login page with email+password form (support@cooldrivepro.com)
- [x] Backend adminAuth router: login/logout/me with independent admin_session cookie (JWT)
- [x] AdminCustomers and AdminTickets now use useAdminAuth hook (independent of Manus OAuth)
- [x] Admin top bar added to both admin pages with navigation and Sign Out button
- [x] Register /admin/login route in App.tsx

## Bug Fix: 创建客户账号报错 (Completed)
- [x] 诊断创建客户时的具体报错（数据库字段缺失 + 邮件 API Key 未配置）
- [x] 修复 customers 表缺少新字段问题（SQL ALTER TABLE 添加 13 个缺失字段）
- [x] 配置 RESEND_API_KEY，Resend API 验证通过（23 tests passed）
- [x] 验证完整创建客户流程（客户账号创建成功，邮件发送就绪）

## Bug Fix: 客户欢迎邮件缺少密码/登录链接 (Current Sprint)
- [ ] 检查 sendCustomerWelcomeEmail 邮件模板内容
- [ ] 确认邮件中包含：初始密码、登录页面链接
- [ ] 修复邮件模板，添加清晰的登录说明
- [ ] 修复 Navbar isAdminLoggedIn 检查 role===admin（而非仅 isAuthenticated）
- [ ] 修复 AdminCustomers/AdminTickets 使用 useAuth 而非 useAdminAuth
- [ ] 运行测试并保存检查点

## 改进：创建客户账号直接显示密码（不依赖邮件）
- [x] 后端：adminCreate 始终返回 initialPassword（不再只在邮件失败时返回）
- [x] 前端：AdminCustomers 弹窗始终显示初始密码供管理员手动告知客户
- [x] 前端：弹窗说明文字改为"请将以下凭据通过微信/WhatsApp告知客户"
- [x] 修复 Navbar isAdminLoggedIn 检查 role===admin（user?.role === 'admin'）
- [x] 修复 AdminCustomers/AdminTickets 使用 useAuth 而非 useAdminAuth
- [x] 去掉强制修改密码限制（passwordChanged 默认为 1，客户直接用初始密码登录）
- [x] 创建 customer_logs 数据库表（之前缺失导致登录日志报错）
- [x] 运行测试并保存检查点（23 tests passed）

## 隐藏 Support 功能入口 (Completed)
- [x] 从 Navbar 顶部导航栏移除 Support 链接
- [x] 从 Navbar 用户下拉菜单隐藏 Customer Portal / Admin Login 入口（仅登录后可见）
- [x] 从 Footer 移除 After-Sales Support 链接
- [x] 用户图标对未登录访客隐藏（只有 admin/customer 登录后才显示）
- [x] 保存检查点

## PageSpeed 性能优化 (Current Sprint)
- [x] Fix Google Fonts still blocking render in PageSpeed (750ms) — switched to fontsource self-hosted fonts
- [ ] Fix CloudFront image cache TTL = None (hero-bg, product images) — CDN-level setting, cannot fix from code
- [x] Replace Unsplash external images with CDN-hosted WebP (ProductsSection.tsx:107 etc.)
- [x] Reduce JS bundle size via manualChunks (vendor split: react-dom, radix, icons, data, utils separated)
- [x] Further reduce: BlogPost.tsx 786KB inline content extracted to JSON files (737KB → 120KB gzip)
- [x] Change website title back to English: already set in index.html (VITE_APP_TITLE is platform-level, user can change in Settings > General)

## Comprehensive PageSpeed Fix (One-Shot)
- [x] Verify fontsource is working (no Google Fonts requests)
- [x] Extract BlogPost.tsx 786KB inline content to JSON files (dynamic import)
- [x] Optimize all remaining images (proper sizing, WebP format)
- [x] Re-upload CDN images with Cache-Control headers
- [x] Verify build output: main JS chunk 120KB gzipped (down from 357KB)
- [x] Run Lighthouse CLI locally to validate score improvement

## Stripe 支付集成 (Pending - 性能优化完成后)
- [ ] 使用 webdev_add_feature 添加 Stripe 集成
- [ ] 配置 Stripe API Key
- [ ] 实现产品购买/订阅支付流程
- [ ] 测试支付功能

## PageSpeed 手机端深度优化 (Current Sprint)
- [x] 路由级代码分割（React.lazy + Suspense）减少首屏 JS — 主包 737KB→102KB
- [x] 压缩/优化 hero 背景图 210KB→88KB（1920→1280px WebP q80）
- [x] 减少首屏组件数量/复杂度 — 7个下方组件 LazySection 延迟渲染
- [x] 优化字体加载关键路径（font-black→font-extrabold 修复）
- [x] 构建验证并测试 — 23/23 测试通过，0 TS 错误

## 产品列表页筛选排序功能 (Current Sprint)
- [x] 创建产品列表页 /products（展示所有产品卡片）
- [x] 添加按类别筛选（Cooling / Heating）
- [x] 添加按价格范围筛选
- [x] 添加按用户评分筛选
- [x] 添加排序功能（价格升序/降序、评分高低、最新）
- [x] 集成到导航和路由
- [x] 测试验证并保存检查点

## 全站产品搜索功能 (Current Sprint)
- [x] 实现 Navbar 搜索图标点击弹出搜索面板
- [x] 搜索覆盖产品、博客、页面等内容
- [x] 实时搜索建议/结果展示
- [x] 键盘快捷键支持（Cmd/Ctrl+K）
- [x] 搜索结果可点击跳转到对应页面
- [x] 测试验证并保存检查点

## 移动端性能深度优化 Round 2 (Current Sprint)
- [x] SearchOverlay 懒加载（从主包移出 22KB，gzip 4KB）
- [x] 分析字体：Montserrat 400 是唯一可延迟的(18KB)，收益太小不值得增加复杂度
- [x] 优化 Navbar tRPC 调用（customer.me 添加 staleTime=5min + refetchOnWindowFocus=false）
- [x] 构建验证并测试 — 23/23 测试通过，0 TS 错误
- [ ] 更新 ecommerce-website-builder-2 Skill
- [x] SearchOverlay 懒加载验证通过 — 搜索功能正常

## 移动端速度深度诊断与修复 (Current Sprint)
- [ ] 用 PageSpeed Insights API 测试线上网站获取具体扣分项
- [ ] 根据扣分项实施针对性优化
- [ ] 验证并保存检查点

## 性能深度优化 Round 3 - 解决 LCP 5.8s / TBT 490ms (Current Sprint)
- [x] 分析构建产物大小和首屏加载的 JS/CSS 总量
- [x] 分析 index.html 中的 preload/modulepreload 链
- [x] 减少首屏 JS 执行量（Navbar lucide→inline SVG, ProductsSection lazy, Toaster/Tooltip deferred, sonner extracted）
- [x] 优化 LCP 元素加载（CSS bg-image→<img> srcSet, 移动端 20KB vs 88KB, responsive preload）
- [x] 优化 FCP（preconnect/dns-prefetch CDN, 字体 7→4 critical + 3 deferred, modulePreload polyfill disabled）
- [x] 检查并优化 CSS 关键路径（CSS 22KB gzip 已优化）
- [x] 验证构建产物并运行测试（23/23 passed, 0 TS errors, no visual regressions）
- [x] 保存检查点并部署验证

## V-TH1 Heating & Cooling Parking AC - New Product Launch (Current Sprint)
- [x] Create V-TH1 product detail page (/products/heating-cooling-ac)
- [x] Create new product popup/modal on homepage
- [x] Update navigation (add V-TH1 to nav items with NEW badge)
- [x] Update product listing page with V-TH1
- [x] Add V-TH1 route to App.tsx
- [x] Add SEO structured data for V-TH1 (Product + ItemList JSON-LD)
- [x] Update sitemap.xml with new product URL
- [x] Write and run tests (23/23 passed, build OK)
- [x] Save checkpoint (version: 0e83d09b)

## Hero Section V-TH1 Button (Current Sprint)
- [x] Add V-TH1 new product CTA button to HeroSection alongside existing buttons
- [x] Verify and save checkpoint

## Navbar Cleanup (Current Sprint)
- [x] Remove Heater from navigation bar
- [x] Remove Lithium Battery from navigation bar
- [x] Verify and save checkpoint

## Product Page CTA & WhatsApp (Current Sprint)
- [x] Change V-TH1 "Request Quote" button from mailto to /contact form page
- [x] Check and fix Request Quote buttons on all other product pages (TopMounted, MiniSplit)
- [x] Add WhatsApp contact button to V-TH1 product page
- [x] Add WhatsApp contact button to TopMounted product page
- [x] Add WhatsApp contact button to MiniSplit product page
- [x] Verify and save checkpoint

## PageSpeed Insights Fixes Round 4 (Current Sprint)
- [x] Fix SEO: "Learn More" link → "Explore V-TH1 Heating & Cooling AC" descriptive anchor text
- [x] Fix contrast: HeroSection NEW badge oklch 0.6→0.45 (darker red)
- [x] Fix contrast: NewProductPopup labels oklch 0.55→0.40 (darker text)
- [x] Optimize font loading chain: add font preload to reduce critical path depth (1,359ms) — Vite plugin injects 3 font preloads before CSS, Inter 500 deferred
- [x] Optimize LCP: popup delay 1.5s→3.5s so Hero image registers as LCP before popup appears
- [x] Further darken all NEW badges (HeroSection, Navbar, NewProductPopup) for WCAG AAA contrast
- [x] Verify and save checkpoint

## VS02 Pro Product Images Update
- [x] Extract and review all 12 VS02 Pro product images from ZIP
- [x] Rename files to descriptive English names
- [x] Optimize images: resize to 1200px max, convert to WebP (total ~290KB vs original ~12MB)
- [x] Upload all 12 optimized images to CDN
- [x] Update Top-Mounted AC product detail page with new VS02 Pro gallery images (12-image gallery with thumbnails, lightbox, navigation)
- [x] Test and verify updated product page (lightbox, navigation arrows, image switching all working)
- [ ] Save checkpoint
