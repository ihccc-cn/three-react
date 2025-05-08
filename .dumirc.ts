import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    name: 'Three-React',
    title: 'Three-React',
    logo: '/logo.png',
  },
  styles: [
    '#root .dumi-default-hero { margin: 64px auto; height: auto; padding: 0; }',
    'section.dumi-default-header-left { width: 240px; }',
    '.dumi-default-navbar-collapse-btn { display: none; }',
    '.dumi-default-navbar-dropdown { width: 8em }',
  ],
  mfsu: false,
  html2sketch: false,
});
