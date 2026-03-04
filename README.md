# 小李同学的个人主页

## 快速开始

### 安装依赖

```sh
pnpm i
```

### 运行开发环境

```sh
pnpm dev
```

### 构建生产环境

```sh
pnpm generate
pnpm preview
```

### 部署指南

推荐使用 Vercel 进行部署，同时也支持 Netlify、Cloudflare Pages 等平台。建议采用静态（SSG）部署方式，也可直接使用“Nuxt 预设”部署。我的部署配置如下：

- 构建命令: `pnpm generate`
- 输出目录: `dist`
- 安装命令: `pnpm i`
