/*
 * © 2021 Thoughtworks, Inc.
 */

// Because the Consumption Management API returns inconsistent strings for region,
// we need to provide arrays of the possible options they could be.
export const AZURE_REGIONS = {
  // Africa regions
  AF_SOUTH_AFRICA: { name: 'southafrica', options: ['southafrica'] },
  AF_SOUTH_AFRICA_NORTH: {
    name: 'southafricanorth',
    options: ['southafricanorth'],
  },
  AF_SOUTH_AFRICA_WEST: {
    name: 'southafricawest',
    options: ['southafricawest'],
  },

  // APAC regions
  AP_AUSTRALIA: { name: 'australia', options: ['australia'] },
  AP_AUSTRALIA_CENTRAL: {
    name: 'australiacentral',
    options: ['australiacentral'],
  },
  AP_AUSTRALIA_CENTRAL2: {
    name: 'australiacentral2',
    options: ['australiacentral2'],
  },
  AP_AUSTRALIA_EAST: { name: 'australiaeast', options: ['australiaeast'] },
  AP_AUSTRALIA_SOUTH_EAST: {
    name: 'australiasoutheast',
    options: ['australiasoutheast'],
  },
  AP_EAST: { name: 'apeast', options: ['apeast'] },
  AP_SOUTH_EAST: { name: 'apsoutheast', options: ['apsoutheast'] },
  AP_JAPAN_EAST: { name: 'japaneast', options: ['japaneast'] },
  AP_JAPAN_WEST: { name: 'japanwest', options: ['japanwest'] },
  AP_JAPAN: { name: 'japan', options: ['japan'] },
  AP_KOREA: { name: 'korea', options: ['korea'] },
  AP_KOREA_EAST: { name: 'koreacentral', options: ['koreacentral'] },
  AP_KOREA_SOUTH: { name: 'koreasouth', options: ['koreasouth'] },
  ASIA: { name: 'asia', options: ['asia'] },
  ASIA_PACIFIC: { name: 'asiapacific', options: ['asiapacific'] },
  ASIA_EAST: { name: 'eastasia', options: ['eastasia', 'asiaeast'] },
  ASIA_EAST_STAGE: { name: 'eastasiastage', options: ['eastasiastage'] },
  ASIA_SOUTH_EAST: {
    name: 'southeastasia',
    options: ['southeastasia', 'AsiaSouthEast', 'asiasoutheast'],
  },
  ASIA_SOUTH_EAST_STAGE: {
    name: 'southeastasiastage',
    options: ['southeastasiastage'],
  },
  INDIA: {
    name: 'india',
    options: ['india'],
  },
  IN_CENTRAL: {
    name: 'centralindia',
    options: ['centralindia', 'IndiaCentral'],
  },
  IN_JIO_CENTRAL: { name: 'jioindiacentral', options: ['jioindiacentral'] },
  IN_JIO_WEST: { name: 'jioindiawest', options: ['jioindiawest'] },
  IN_SOUTH: { name: 'southindia', options: ['southindia'] },
  IN_WEST: { name: 'westindia', options: ['westindia'] },

  // EU regions
  EU_NORTH: { name: 'northeurope', options: ['northeurope', 'europenorth'] },
  EU_WEST: { name: 'westeurope', options: ['westeurope', 'WESTEUROPE'] },
  EU_FRANCE_CENTRAL: { name: 'francecentral', options: ['francecentral'] },
  EU_FRANCE_SOUTH: { name: 'francesouth', options: ['francesouth'] },
  EU_FRANCE: { name: 'france', options: ['france'] },
  EU_SWEDEN_CENTRAL: { name: 'swedencentral', options: ['swedencentral'] },
  EU_SWITZERLAND: { name: 'switzerland', options: ['switzerland'] },
  EU_SWITZERLAND_NORTH: {
    name: 'switzerlandnorth',
    options: ['switzerlandnorth'],
  },
  EU_SWITZERLAND_WEST: {
    name: 'switzerlandwest',
    options: ['switzerlandwest'],
  },
  UK_SOUTH: { name: 'uksouth', options: ['uksouth', 'UKSOUTH'] },
  UK_WEST: { name: 'ukwest', options: ['ukwest'] },
  EU_GERMANY: { name: 'germany', options: ['germany'] },
  EU_GERMANY_NORTH: { name: 'germanynorth', options: ['germanynorth'] },
  EU_GERMANY_WESTCENTRAL: {
    name: 'germanywestcentral',
    options: ['germanywestcentral'],
  },
  EU_NORWAY: { name: 'norway', options: ['norway'] },
  EU_NORWAY_EAST: { name: 'norwayeast', options: ['norwayeast'] },
  EU_NORWAY_WEST: { name: 'norwaywest', options: ['norwaywest'] },
  EU_UK: { name: 'uk', options: ['uk'] },

  // Middle East regions
  ME_UAE: { name: 'uae', options: ['uae'] },
  ME_UAE_CENTRAL: { name: 'uaecentral', options: ['uaecentral'] },
  ME_UAE_NORTH: { name: 'uaenorth', options: ['uaenorth'] },

  // America regions
  US_CANADA: { name: 'canada', options: ['canada'] },
  US_CANADA_CENTRAL: { name: 'canadacentral', options: ['canadacentral'] },
  US_CANADA_EAST: { name: 'canadaeast', options: ['canadaeast'] },
  US_CENTRAL: { name: 'CentralUS', options: ['CentralUS'] },
  US_CENTRAL_EUAP: { name: 'centraluseuap', options: ['centraluseuap'] },
  US_CENTRAL_STAGE: { name: 'centralusstage', options: ['centralusstage'] },
  US_EAST: {
    name: 'EastUS',
    options: ['EastUS', 'EASTUS', 'USEast', 'useast'],
  },
  US_EAST_STAGE: { name: 'eastusstage', options: ['eastusstage'] },
  US_EAST_2: { name: 'EastUS2', options: ['EastUS2', 'useast2'] },
  US_EAST_2_EUAP: { name: 'eastus2euap', options: ['eastus2euap'] },
  US_EAST_2_STAGE: { name: 'eastus2stage', options: ['eastus2stage'] },
  US_EAST_3: { name: 'EastUS3', options: ['EastUS3'] },
  US_NORTH_CENTRAL: {
    name: 'NorthCentralUs',
    options: ['NorthCentralUs', 'northcentralus'],
  },
  US_NORTH_CENTRAL_STAGE: {
    name: 'northcentralusstage',
    options: ['northcentralusstage'],
  },
  US_SOUTH_CENTRAL: { name: 'SouthCentralUS', options: ['SouthCentralUS'] },
  US_SOUTH_CENTRAL_STAGE: {
    name: 'southcentralusstage',
    options: ['southcentralusstage'],
  },
  US_US: { name: 'unitedstates', options: ['unitedstates'] },
  US_US_EAP: { name: 'unitedstateseuap', options: ['unitedstateseuap'] },
  US_WEST_CENTRAL: {
    name: 'WestCentralUS',
    options: ['WestCentralUS', 'westcentralus'],
  },
  US_NORTH: { name: 'USNorth', options: ['USNorth'] },
  US_WEST: { name: 'WestUS', options: ['WestUS', 'westus'] },
  US_WEST_STAGE: { name: 'westusstage', options: ['westusstage'] },
  US_WEST_2: { name: 'westus2', options: ['westus2', 'uswest2', 'WESTUS2'] },
  US_WEST_2_STAGE: { name: 'westus2stage', options: ['westus2stage'] },
  US_WEST_3: { name: 'westus3', options: ['westus3', 'uswest3'] },
  BRAZIL: { name: 'brazil', options: ['brazil'] },
  BRAZIL_SOUTH: { name: 'brazilsouth', options: ['brazilsouth'] },
  BRAZIL_SOUTH_EAST: { name: 'brazilsoutheast', options: ['brazilsoutheast'] },

  ALL: { name: 'All Regions', options: ['All Regions'] },
  UNASSIGNED: { name: 'Unassigned', options: ['Unassigned'] },
  UNKNOWN: { name: 'Unknown', options: ['Unknown'] },
}
