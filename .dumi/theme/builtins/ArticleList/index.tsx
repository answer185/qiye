import React from 'react';
import { Link } from 'dumi';
import './index.less';

// 静态写死分类及文章，后续可在本文件直接修改（本站仅中文）
const STATIC_DATA: Record<string, { title: string; list: { title: string; link: string }[] }> = {
  erp: {
    title: '鞋材ERP',
    list: [
      { title: '鞋材ERP', link: '/project/erp' },
    ],
  },
  enterprise: {
    title: '企业应用',
    list: [
      { title: '企业应用', link: '/project/enterprise' },
      { title: 'Admin模板', link: '/project/enterprise/project-admin-template' },
      { title: '系统组件库', link: '/project/enterprise/project-component' },
      { title: '红圈营销', link: '/project/enterprise/project-hq' },
      { title: '空手上货', link: '/project/enterprise/project-ks' },
      { title: '微前端应用', link: '/project/enterprise/project-micro' },
      { title: '基于 react-hook-form 的表单', link: '/project/enterprise/scenario-form' },
      { title: 'shadcn/ui 开发总结', link: '/project/enterprise/scenario-shadcn' },
      { title: 'Tailwind 开发总结', link: '/project/enterprise/scenario-tailwind' },
      { title: '高并发场景下通信选型', link: '/project/enterprise/sse' },
    ],
  },
  ecommerce: {
    title: '电商应用',
    list: [
      { title: '电商应用', link: '/project/ecommerce' },
      { title: '基于Magento2+Docker的快速建站方案', link: '/project/ecommerce/magento2-docker' },
    ],
  },
  dev: {
    title: '前端开发',
    list: [
      { title: '前端工程化概述', link: '/tech/frontend' },
      { title: '前端架构', link: '/tech/frontend/architecture' },
      { title: 'React Hooks', link: '/tech/frontend/react-hooks' },
      { title: 'React TypeScript', link: '/tech/frontend/react-ts' },
      { title: 'Tailwind CSS', link: '/tech/frontend/tailwindcss' },
      { title: '性能优化', link: '/tech/frontend/optimize' },
      { title: '基础加载', link: '/tech/frontend/basic-load' },
      { title: 'React 生命周期', link: '/tech/frontend/react-lifecycle' },
      { title: 'shadcn-ui', link: '/tech/frontend/shadcn-ui' },
      { title: 'Next.js 国际化', link: '/tech/frontend/next-intl' },
    ],
  },
  laravel: {
    title: '后端开发',
    list: [
      { title: '后端开发', link: '/tech/backend' },
    ],
  },
  ai: {
    title: 'AI编程',
    list: [
      { title: 'AI编程', link: '/tech/ai' },
      { title: 'Cursor：基于Figma设计稿开发', link: '/tech/ai/cursor-figma' },
    ],
  },
  ops: {
    title: '运维',
    list: [
      { title: '运维', link: '/tech/ops' },
      { title: 'Docker的基础概念', link: '/tech/ops/docker-basics' },
    ],
  },
};

const CATEGORY_ORDER = ['erp', 'enterprise', 'ecommerce', 'dev', 'laravel', 'ai', 'ops'];

export default function ArticleList() {
  return (
    <div className="dumi-article-list">
      {CATEGORY_ORDER.map((key) => {
        const block = STATIC_DATA[key];
        if (!block || !block.list?.length) return null;
        return (
          <section key={key} className="dumi-article-list-block">
            <h3 className="dumi-article-list-title">{block.title}</h3>
            <ul className="dumi-article-list-ul">
              {block.list.slice(0, 10).map((item) => (
                <li key={item.link}>
                  <Link to={item.link}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
