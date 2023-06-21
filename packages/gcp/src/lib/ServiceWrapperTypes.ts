import { google } from '@google-cloud/compute/build/protos/protos'
import InstancesScopedList = google.cloud.compute.v1.IInstancesScopedList
import DisksScopedList = google.cloud.compute.v1.IDisksScopedList
import AddressesScopedList = google.cloud.compute.v1.AddressesScopedList

export type IterableScopedList = AsyncIterable<ScopedListResult>

export type ScopedListResult = [
  string,
  InstancesScopedList | DisksScopedList | AddressesScopedList,
]
