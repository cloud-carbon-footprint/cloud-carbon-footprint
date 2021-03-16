module.exports = {
  title: 'Cloud Carbon Footprint',
  tagline: 'Cloud Carbon Footprint',
  url: 'https://ThoughtWorks-Cleantech.github.io',
  baseUrl: '/',
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'ThoughtWorks-Cleantech', // Usually your GitHub org/user name.
  projectName: 'www.cloudcarbonfootprint.org', // Usually your repo name.
  themeConfig: {
    sidebarCollapsible: false,
    navbar: {
      title: 'Cloud Carbon Footprint',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'docs/getting-started',
          label: 'Try Now',
          position: 'right',
          className: 'navbar__link',
        },
      ],
    },
    footer: {},
    colorMode: {
      disableSwitch: true,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),

          // Please change this to your repo.
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
