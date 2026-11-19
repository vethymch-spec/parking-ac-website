# CoolDrivePro 正式站发布

先读 /Users/apple/Documents/VETHY-Websites 下的 START-HERE.txt、AGENTS.md 和 websites.json，再核对 operations 中的最新记录。正式域名是 cooldrivepro.com，服务在腾讯香港。

用户要求发布时，从本项目目录直接执行 `python3 scripts/publish-tencent.py`。这条命令使用 operations/active-tencent-release.json 指定的发布包。准备下一版时，把这个文件指向相应的 CoolDrivePro 发布目录。执行 `python3 scripts/publish-tencent.py --check` 可单独检查文件包，`--status` 可查看该版最新生产回执。

正式发布沿用每个包的现网核对、部署锁、备份及回退流程。以公网核验回执报告上线。如果当前执行环境拒绝连接，报告具体目标和错误，并说明线上状态。
