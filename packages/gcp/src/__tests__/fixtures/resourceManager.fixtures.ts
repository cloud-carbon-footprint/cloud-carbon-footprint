/*
 * © 2021 Thoughtworks, Inc.
 */

import { protos } from '@google-cloud/resource-manager'
import Project = protos.google.cloud.resourcemanager.v3.IProject

export const mockedProjects: Partial<Project>[][] = [
  [
    {
      projectId: 'project',
      displayName: 'project-name',
      state: 'ACTIVE',
    },
    {
      projectId: 'project-1',
      displayName: 'project-name-1',
      state: 'DELETE_REQUESTED',
    },
  ],
]
