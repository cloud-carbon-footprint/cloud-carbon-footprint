/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

module.exports = {
  tryNowSidebar: {
    'Get Started': ['getting-started'],
    'Running Locally': [
      {
        'Running the Web App': [
          'run-with-mocked-data',
          { 'Connect to Real Data': ['aws', 'gcp', 'azure'] },
          'run-with-docker',
        ],
      },
      'running-the-cli',
    ],
  },
}
