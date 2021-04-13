/*
 * © 2021 ThoughtWorks, Inc.
 */

module.exports = {
  tryNowSidebar: [
    {
      type: 'category',
      label: 'Cloud Carbon Footprint',
      collapsed: false,
      items: ['overview', 'methodology'],
    },
    {
      type: 'category',
      label: 'Running Locally',
      collapsed: false,
      items: [
        'introduction',
        'getting-started',
        'create-app',
        'run-with-mocked-data',
        {
          type: 'category',
          label: 'Connect to Real Data',
          collapsed: false,
          items: ['aws', 'gcp', 'azure', 'alternative-data-approaches'],
        },
        'run-with-docker',
        'running-the-cli',
        {
          type: 'category',
          label: 'Configuration Options',
          collapsed: false,
          items: ['performance-configurations', 'configurations-glossary'],
        },
        'deploying',
        'keeping-ccf-updated',
      ],
    },
  ],
}
