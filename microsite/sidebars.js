/*
 * © 2021 Thoughtworks, Inc.
 */

module.exports = {
  tryNowSidebar: [
    {
      type: 'category',
      label: 'Cloud Carbon Footprint',
      collapsed: false,
      items: ['overview', {
        type: 'category',
        label: 'How It Works',
        collapsed: false,
        items: ['methodology', 'classifying-usage-types'],
      },
      ],
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
        'get-recommendations',
        'run-with-docker',
        'running-the-cli',
        'creating-a-lookup-table',
        {
          type: 'category',
          label: 'Configuration Options',
          collapsed: false,
          items: ['performance-configurations', 'configurations-glossary'],
        },
        'deploying',
      ],
    },
  ],
}
