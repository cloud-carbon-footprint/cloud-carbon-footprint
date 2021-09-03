/*
 * © 2021 Thoughtworks, Inc.
 */

import { google } from '@google-cloud/recommender/build/protos/protos'
import IRecommendation = google.cloud.recommender.v1.IRecommendation

export type ActiveProject = {
  id: string
  name: string
  zones: string[]
}
export type RecommenderRecommendations = {
  id: string
  zone: string
  recommendations: IRecommendation[]
}

export type ResourceDetails = {
  resourceId: string
  resourceName: string
}

export type UnknownRecommendationDetails = {
  rec: IRecommendation
  zone: string
  cost: number
  resourceDetails: ResourceDetails
}

export enum RECOMMENDATION_TYPES {
  STOP_VM = 'STOP_VM',
  SNAPSHOT_AND_DELETE_DISK = 'SNAPSHOT_AND_DELETE_DISK',
  CHANGE_MACHINE_TYPE = 'CHANGE_MACHINE_TYPE',
  DELETE_DISK = 'DELETE_DISK',
  DELETE_ADDRESS = 'DELETE_ADDRESS',
  DELETE_IMAGE = 'DELETE_IMAGE',
}
