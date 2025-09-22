import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    name: '七夜',
    logo: '/logo.png',
    footer: 'Copyright © 2025 七夜博客 <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">闽ICP备2025085248号-1</a>',
  },
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
});
