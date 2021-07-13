/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Project } from '@google-cloud/resource-manager'

export const mockedProjects: Partial<Project>[][] = [
  [
    {
      id: 'project',
      metadata: {
        name: 'project-name',
        lifecycleState: 'ACTIVE',
      },
    },
  ],
]
