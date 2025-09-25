#!/bin/bash

# 部署脚本
echo "🚀 开始部署多智能体DSL框架..."

# 导航到项目目录
cd /Users/Apple/Desktop/multi-agent-dsl-final

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 添加修改的文件
echo "📁 添加修改的文件..."
git add frontend/src/index.js frontend/package.json frontend/build/

# 提交更改
echo "💾 提交更改..."
git commit -m "feat: 优化知识图谱可视化，增强论文展示效果

- 更新知识图谱节点和连接关系
- 添加英文界面，适合学术展示
- 增强节点交互和详情显示
- 优化可视化效果和配色方案
- 添加连接标签和权重显示"

# 推送到远程仓库
echo "🌐 推送到GitHub..."
git push origin gh-pages

echo "✅ 部署完成！"
echo "🔗 访问地址: https://max-yuan-22.github.io/Multi-Agent_DSLframework-2025/"
