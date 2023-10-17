/*
 * © 2021 Thoughtworks, Inc.
 */

// Because the Consumption Management API returns inconsistent strings for region,
// we need to provide arrays of the possible options they could be.
import { mappedRegionsToElectricityMapZones } from '@cloud-carbon-footprint/common'

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
  AP_AUSTRALIA_EAST: {
    name: 'australiaeast',
    options: ['australiaeast', 'AustraliaEast', 'AUSTRALIAEAST'],
  },
  AP_AUSTRALIA_SOUTH_EAST: {
    name: 'australiasoutheast',
    options: ['australiasoutheast', 'AustraliaSouthEast', 'AUSTRALIASOUTHEAST'],
  },
  AP_EAST: { name: 'apeast', options: ['apeast', 'AP East'] },
  AP_SOUTH_EAST: {
    name: 'apsoutheast',
    options: ['apsoutheast', 'AP Southeast'],
  },
  AP_JAPAN_EAST: { name: 'japaneast', options: ['japaneast', 'JA East'] },
  AP_JAPAN_WEST: { name: 'japanwest', options: ['japanwest', 'JA West'] },
  AP_JAPAN: { name: 'japan', options: ['japan'] },
  AP_KOREA: { name: 'korea', options: ['korea'] },
  AP_KOREA_EAST: {
    name: 'koreacentral',
    options: ['koreacentral', 'KR Central'],
  },
  AP_KOREA_SOUTH: { name: 'koreasouth', options: ['koreasouth'] },
  ASIA: { name: 'asia', options: ['asia', 'Asia'] },
  ASIA_PACIFIC: { name: 'asiapacific', options: ['asiapacific'] },
  ASIA_EAST: { name: 'eastasia', options: ['eastasia', 'asiaeast'] },
  ASIA_EAST_STAGE: { name: 'eastasiastage', options: ['eastasiastage'] },
  ASIA_SOUTH_EAST: {
    name: 'southeastasia',
    options: [
      'southeastasia',
      'AsiaSouthEast',
      'asiasoutheast',
      'SOUTHEASTASIA',
    ],
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
    options: ['centralindia', 'IndiaCentral', 'IN Central'],
  },
  IN_JIO_CENTRAL: { name: 'jioindiacentral', options: ['jioindiacentral'] },
  IN_JIO_WEST: { name: 'jioindiawest', options: ['jioindiawest'] },
  IN_SOUTH: { name: 'southindia', options: ['southindia'] },
  IN_WEST: { name: 'westindia', options: ['westindia'] },

  // EU regions
  EU_NORTH: {
    name: 'northeurope',
    options: ['northeurope', 'europenorth', 'NORTHEUROPE', 'EU North'],
  },
  EU_WEST: {
    name: 'westeurope',
    options: ['westeurope', 'WESTEUROPE', 'EU West', 'EuropeWest'],
  },
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
    options: ['germanywestcentral', 'GERMANYWESTCENTRAL', 'DE West Central'],
  },
  EU_NORWAY: { name: 'norway', options: ['norway'] },
  EU_NORWAY_EAST: { name: 'norwayeast', options: ['norwayeast'] },
  EU_NORWAY_WEST: { name: 'norwaywest', options: ['norwaywest'] },
  EU_UK: { name: 'uk', options: ['uk'] },

  // Middle East regions
  ME_UAE: { name: 'uae', options: ['uae'] },
  ME_UAE_CENTRAL: { name: 'uaecentral', options: ['uaecentral'] },
  ME_UAE_NORTH: { name: 'uaenorth', options: ['uaenorth', 'uaen'] },
  ME_QATAR_CENTRAL: { name: 'qatarcentral', options: ['qatarcentral'] },

  // America regions
  US_CANADA: { name: 'canada', options: ['canada'] },
  US_CANADA_CENTRAL: { name: 'canadacentral', options: ['canadacentral'] },
  US_CANADA_EAST: { name: 'canadaeast', options: ['canadaeast'] },
  US_CENTRAL: {
    name: 'CentralUS',
    options: ['CentralUS', 'US Central', 'centralus', 'CENTRALUS'],
  },
  US_CENTRAL_EUAP: { name: 'centraluseuap', options: ['centraluseuap'] },
  US_CENTRAL_STAGE: { name: 'centralusstage', options: ['centralusstage'] },
  US_EAST: {
    name: 'EastUS',
    options: ['EastUS', 'EASTUS', 'USEast', 'useast', 'US East', 'eastus'],
  },
  US_EAST_STAGE: { name: 'eastusstage', options: ['eastusstage'] },
  US_EAST_2: {
    name: 'EastUS2',
    options: ['EastUS2', 'useast2', 'US East 2', 'eastus2', 'EASTUS2'],
  },
  US_EAST_2_EUAP: { name: 'eastus2euap', options: ['eastus2euap'] },
  US_EAST_2_STAGE: { name: 'eastus2stage', options: ['eastus2stage'] },
  US_EAST_3: { name: 'EastUS3', options: ['EastUS3'] },
  US_NORTH_CENTRAL: {
    name: 'NorthCentralUs',
    options: ['NorthCentralUs', 'northcentralus', 'US North Central'],
  },
  US_NORTH_CENTRAL_STAGE: {
    name: 'northcentralusstage',
    options: ['northcentralusstage'],
  },
  US_SOUTH_CENTRAL: {
    name: 'SouthCentralUS',
    options: ['SouthCentralUS', 'southcentralus'],
  },
  US_SOUTH_CENTRAL_STAGE: {
    name: 'southcentralusstage',
    options: ['southcentralusstage'],
  },
  US_US: { name: 'unitedstates', options: ['unitedstates'] },
  US_US_EAP: { name: 'unitedstateseuap', options: ['unitedstateseuap'] },
  US_WEST_CENTRAL: {
    name: 'WestCentralUS',
    options: [
      'WestCentralUS',
      'westcentralus',
      'US West Central',
      'WESTCENTRALUS',
    ],
  },
  US_NORTH: { name: 'USNorth', options: ['USNorth'] },
  US_WEST: { name: 'WestUS', options: ['WestUS', 'westus', 'US West'] },
  US_WEST_STAGE: { name: 'westusstage', options: ['westusstage'] },
  US_WEST_2: {
    name: 'westus2',
    options: ['westus2', 'uswest2', 'WESTUS2', 'US West 2'],
  },
  US_WEST_2_STAGE: { name: 'westus2stage', options: ['westus2stage'] },
  US_WEST_3: { name: 'westus3', options: ['westus3', 'uswest3'] },
  BRAZIL: { name: 'brazil', options: ['brazil'] },
  BRAZIL_SOUTH: { name: 'brazilsouth', options: ['brazilsouth'] },
  BRAZIL_SOUTH_EAST: { name: 'brazilsoutheast', options: ['brazilsoutheast'] },

  ALL: {
    name: 'All Regions',
    options: ['All Regions', 'GLOBAL', 'Intercontinental', 'global'],
  },
  UNASSIGNED: { name: 'Unassigned', options: ['Unassigned'] },
  UNKNOWN: { name: 'Unknown', options: ['Unknown'] },
}

export const AZURE_MAPPED_REGIONS_TO_ELECTRICITY_MAPS_ZONES: mappedRegionsToElectricityMapZones =
  {
    [AZURE_REGIONS.AF_SOUTH_AFRICA_NORTH.name]: 'ZA',
    [AZURE_REGIONS.AF_SOUTH_AFRICA_WEST.name]: 'ZA',

    [AZURE_REGIONS.AP_AUSTRALIA_CENTRAL.name]: 'AU-NSW',
    [AZURE_REGIONS.AP_AUSTRALIA_CENTRAL2.name]: 'AU-NSW',
    [AZURE_REGIONS.AP_AUSTRALIA_EAST.name]: 'AU-NSW',
    [AZURE_REGIONS.AP_AUSTRALIA_SOUTH_EAST.name]: 'AU-VIC',

    [AZURE_REGIONS.AP_EAST.name]: null,
    [AZURE_REGIONS.AP_SOUTH_EAST.name]: 'SG',

    [AZURE_REGIONS.AP_JAPAN_EAST.name]: 'JP-TK',
    [AZURE_REGIONS.AP_JAPAN_WEST.name]: 'JP-KN',

    [AZURE_REGIONS.AP_KOREA_EAST.name]: 'KR',
    [AZURE_REGIONS.AP_KOREA_SOUTH.name]: 'KR',

    [AZURE_REGIONS.IN_CENTRAL.name]: 'IN-WE',
    [AZURE_REGIONS.IN_SOUTH.name]: 'IN-SO',
    [AZURE_REGIONS.IN_WEST.name]: 'IN-WE',

    [AZURE_REGIONS.EU_NORTH.name]: 'IE',
    [AZURE_REGIONS.EU_WEST.name]: 'NL',

    [AZURE_REGIONS.EU_FRANCE_CENTRAL.name]: 'FR',
    [AZURE_REGIONS.EU_FRANCE_SOUTH.name]: 'FR',

    [AZURE_REGIONS.EU_SWEDEN_CENTRAL.name]: 'SE-SE3',

    [AZURE_REGIONS.EU_SWITZERLAND_NORTH.name]: 'CH',
    [AZURE_REGIONS.EU_SWITZERLAND_WEST.name]: 'CH',

    [AZURE_REGIONS.UK_SOUTH.name]: 'GB',
    [AZURE_REGIONS.UK_WEST.name]: 'GB',
    [AZURE_REGIONS.EU_UK.name]: 'GB',

    [AZURE_REGIONS.EU_GERMANY.name]: 'DE',
    [AZURE_REGIONS.EU_GERMANY_NORTH.name]: 'DE',
    [AZURE_REGIONS.EU_GERMANY_WESTCENTRAL.name]: 'DE',

    [AZURE_REGIONS.EU_NORWAY_EAST.name]: 'NO-NO1',
    [AZURE_REGIONS.EU_NORWAY_WEST.name]: 'NO-NO2',

    [AZURE_REGIONS.ME_UAE_CENTRAL.name]: null,
    [AZURE_REGIONS.ME_UAE_NORTH.name]: null,

    [AZURE_REGIONS.US_CANADA_CENTRAL.name]: 'CA-ON',
    [AZURE_REGIONS.US_CANADA_EAST.name]: 'CA-QC',

    [AZURE_REGIONS.US_CENTRAL.name]: 'US-MIDW-MISO',
    [AZURE_REGIONS.US_CENTRAL_EUAP.name]: 'US-MIDW-MISO',
    [AZURE_REGIONS.US_CENTRAL_STAGE.name]: 'US-MIDW-MISO',
    [AZURE_REGIONS.US_US.name]: 'US-MIDW-MISO',
    [AZURE_REGIONS.US_US_EAP.name]: 'US-MIDW-MISO',

    [AZURE_REGIONS.US_EAST.name]: 'US-MIDA-PJM',
    [AZURE_REGIONS.US_EAST_STAGE.name]: 'US-MIDA-PJM',
    [AZURE_REGIONS.US_EAST_2.name]: 'US-MIDA-PJM',
    [AZURE_REGIONS.US_EAST_2_EUAP.name]: 'US-MIDA-PJM',
    [AZURE_REGIONS.US_EAST_2_STAGE.name]: 'US-MIDA-PJM',
    [AZURE_REGIONS.US_EAST_3.name]: 'US-MIDA-PJM',

    [AZURE_REGIONS.US_NORTH.name]: 'US-MIDW-MISO',
    [AZURE_REGIONS.US_NORTH_CENTRAL.name]: 'US-MIDW-MISO',
    [AZURE_REGIONS.US_NORTH_CENTRAL_STAGE.name]: 'US-MIDW-MISO',

    [AZURE_REGIONS.US_SOUTH_CENTRAL.name]: 'US-TEX-ERCO',
    [AZURE_REGIONS.US_SOUTH_CENTRAL_STAGE.name]: 'US-TEX-ERCO',

    [AZURE_REGIONS.US_WEST_CENTRAL.name]: 'US-NW-PACE',
    [AZURE_REGIONS.US_WEST.name]: 'US-CAL-CISO',
    [AZURE_REGIONS.US_WEST_STAGE.name]: 'US-CAL-CISO',
    [AZURE_REGIONS.US_WEST_2.name]: 'US-NW-PACE',
    [AZURE_REGIONS.US_WEST_2_STAGE.name]: 'US-NW-PACE',
    [AZURE_REGIONS.US_WEST_3.name]: 'US-NW-PACE',

    [AZURE_REGIONS.BRAZIL_SOUTH.name]: 'BR-CS',
    [AZURE_REGIONS.BRAZIL_SOUTH_EAST.name]: 'BR-CS',

    [AZURE_REGIONS.UNKNOWN.name]: null,
  }
