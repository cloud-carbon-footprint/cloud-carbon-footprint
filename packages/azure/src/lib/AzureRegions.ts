/*
 * © 2021 Thoughtworks, Inc.
 */

// Because the Consumption Management API returns inconsistent strings for region,
// we need to provide arrays of the possible options they could be.
export const AZURE_REGIONS = {
  AP_EAST: { name: 'apeast', options: ['apeast'] },
  AP_SOUTH_EAST: { name: 'apsoutheast', options: ['apsoutheast'] },
  ASIA: { name: 'asia', options: ['asia'] },
  ASIA_EAST: { name: 'eastasia', options: ['eastasia'] },
  ASIA_SOUTH_EAST: {
    name: 'southeastasia',
    options: ['southeastasia', 'AsiaSouthEast'],
  },
  EU_NORTH: { name: 'northeurope', options: ['northeurope'] },
  EU_WEST: { name: 'westeurope', options: ['westeurope'] },
  IN_CENTRAL: { name: 'centralindia', options: ['centralindia'] },
  IN_SOUTH: { name: 'southindia', options: ['southindia'] },
  IN_WEST: { name: 'westindia', options: ['westindia'] },
  UK_SOUTH: { name: 'uksouth', options: ['uksouth'] },
  UK_WEST: { name: 'ukwest', options: ['ukwest'] },
  US_CENTRAL: { name: 'CentralUS', options: ['CentralUS'] },
  US_EAST: { name: 'EastUS', options: ['EastUS'] },
  US_EAST_2: { name: 'EastUS2', options: ['EastUS2'] },
  US_EAST_3: { name: 'EastUS3', options: ['EastUS3'] },
  US_NORTH_CENTRAL: { name: 'NorthCentralUs', options: ['NorthCentralUs'] },
  US_SOUTH_CENTRAL: { name: 'SouthCentralUS', options: ['SouthCentralUS'] },
  US_WEST_CENTRAL: { name: 'WestCentralUS', options: ['WestCentralUS'] },
  US_NORTH: { name: 'USNorth', options: ['USNorth'] },
  US_WEST: { name: 'WestUS', options: ['WestUS'] },
  US_WEST_2: { name: 'westus2', options: ['westus2', 'uswest2'] },
  US_WEST_3: { name: 'westus3', options: ['westus3', 'uswest3'] },
  ALL: { name: 'All Regions', options: ['All Regions'] },
  UNASSIGNED: { name: 'Unassigned', options: ['Unassigned'] },
  UNKNOWN: { name: 'Unknown', options: ['Unknown'] },
}
