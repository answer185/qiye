import { useRouteMeta, useSidebarData, useSiteData, useLocation } from 'dumi';
import React from 'react';
import ArticleList from '../../builtins/ArticleList';
import 'dumi/theme-default/slots/Content/index.less';
import 'dumi/theme-default/styles/heti.less';

export default function Content(props: { children: React.ReactNode }) {
  const sidebar = useSidebarData();
  const { themeConfig } = useSiteData();
  const { frontmatter } = useRouteMeta();
  const { pathname } = useLocation();
  const isIndex = pathname === '/' || pathname === '';

  return (
    <div
      className="dumi-default-content"
      data-no-sidebar={!sidebar || frontmatter?.sidebar === false || undefined}
      data-no-footer={themeConfig?.footer === false || undefined}
    >
      {props.children}
      {isIndex && <ArticleList />}
    </div>
  );
}
