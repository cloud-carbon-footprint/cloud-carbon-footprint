/*
 * © 2021 Thoughtworks, Inc.
 */

module.exports = {
  title: 'Cloud Carbon Footprint',
  tagline: 'Cloud Carbon Footprint',
  url: 'https://cloud-carbon-footprint.github.io',
  baseUrl: '/',
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'cloud-carbon-footprint', // Usually your GitHub org/user name.
  projectName: 'www.cloudcarbonfootprint.org', // Usually your repo name.
  plugins: [require.resolve('docusaurus-plugin-image-zoom')],
  themeConfig: {
    algolia: {
      appId: 'L8RY6HBDJZ',
      apiKey: '2b50463b5c42cbd54bd17edc2cfd153b',
      indexName: 'cloudcarbonfootprint',
    },
    navbar: {
      title: 'Cloud Carbon Footprint',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: 'docs/getting-started',
          label: 'Get Started',
          position: 'left',
          className: 'navbar__link',
        },
        {
          to: 'docs/',
          label: 'Docs',
          position: 'left',
          className: 'navbar__link',
        },
        {
          to: 'https://demo.cloudcarbonfootprint.org/',
          label: 'Demo',
          position: 'left',
          className: 'navbar__link',
        },
        {
          to: 'https://github.com/cloud-carbon-footprint/cloud-carbon-footprint',
          label: 'Github',
          position: 'left',
          className: 'navbar__link',
        },
      ],
    },
    zoom: {
      selector: '.markdown :not(em) > img',
      config: {
        background: {
          light: 'rgb(255, 255, 255)',
          dark: 'rgb(50, 50, 50)',
        },
      },
    },
    footer: {},
    colorMode: {
      // "light" | "dark"
      defaultMode: 'light',

      // Hides the switch in the navbar
      disableSwitch: false,

      // Should we use the prefers-color-scheme media-query,
      // using user system preferences, instead of the hardcoded defaultMode
      respectPrefersColorScheme: true,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarCollapsible: true,
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
