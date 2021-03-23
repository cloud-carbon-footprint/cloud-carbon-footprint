/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

module.exports = {
  tryNowSidebar: [
    {
      type: 'category',
      label: 'Get Started',
      collapsed: false,
      items: ['getting-started'],
    },
    {
      type: 'category',
      label: 'Running Locally',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Running the Web App',
          collapsed: false,
          items: [
            'run-with-mocked-data',
            {
              type: 'category',
              label: 'Connect to Real Data',
              collapsed: false,
              items: ['aws', 'gcp', 'azure', 'alternative-data-approaches'],
            },
            'run-with-docker',
          ],
        },
        'running-the-cli',
        'performance-configuration',
        'deploying',
      ],
    },
  ],
}
