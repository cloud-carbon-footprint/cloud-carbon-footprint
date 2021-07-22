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
  organizationName: 'Tcloud-carbon-footprint', // Usually your GitHub org/user name.
  projectName: 'www.cloudcarbonfootprint.org', // Usually your repo name.
  themeConfig: {
    sidebarCollapsible: true,
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
        {
          to: 'docs/overview',
          label: 'Docs',
          position: 'right',
          className: 'navbar__link',
        },
        {
          to:
            'https://github.com/cloud-carbon-footprint/cloud-carbon-footprint',
          label: 'Github',
          position: 'right',
          className: 'navbar__link',
        },
      ],
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

      // Dark/light switch icon options
      switchConfig: {
        // Icon for the switch while in dark mode
        darkIcon: '🌙',

        // CSS to apply to dark icon,
        // React inline style object
        // see https://reactjs.org/docs/dom-elements.html#style
        darkIconStyle: {
          marginLeft: '1px',
        },

        // Unicode icons such as '\u2600' will work
        // Unicode with 5 chars require brackets: '\u{1F602}'
        lightIcon: '☀️',

        lightIconStyle: {
          marginLeft: '1px',
        },
      },
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
