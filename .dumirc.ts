import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    name: '七夜',
    logo: '/logo.png'
  },
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
});
