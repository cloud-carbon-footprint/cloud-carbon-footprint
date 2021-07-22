/*
 * © 2021 Thoughtworks, Inc.
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
    {
      id: 'project-1',
      metadata: {
        name: 'project-name-1',
        lifecycleState: 'DELETE REQUESTED',
      },
    },
  ],
]
