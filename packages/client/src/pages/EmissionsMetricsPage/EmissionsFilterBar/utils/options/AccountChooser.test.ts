import { AccountChooser } from './AccountChooser'
import { DropdownOption, FilterOptions } from '../../../../../Types'
import { DropdownSelections } from '../../../../../common/FilterBar/utils/FiltersUtil'

describe('AccountChooser - withAccounts', () => {
  it('should add all services for a new cloud provider', () => {
    const awsProvider: DropdownOption = {
      key: 'aws',
      name: 'AWS',
      cloudProvider: 'aws',
    }
    const gcpProvider: DropdownOption = {
      key: 'gcp',
      name: 'GCP',
      cloudProvider: 'gcp',
    }
    const awsService1: DropdownOption = {
      key: 'ec2',
      name: 'EC2',
      cloudProvider: 'aws',
    }
    const awsService2: DropdownOption = {
      key: 's3',
      name: 'S3',
      cloudProvider: 'aws',
    }
    const gcpService1: DropdownOption = {
      key: 'compute',
      name: 'Compute',
      cloudProvider: 'gcp',
    }

    const filterOptions: FilterOptions = {
      accounts: [],
      cloudProviders: [awsProvider, gcpProvider],
      services: [awsService1, awsService2, gcpService1],
    }

    // Simulate selecting GCP, but old selection was AWS
    const selections: DropdownOption[] = [gcpProvider]
    const oldSelections: DropdownSelections = {
      cloudProviders: [awsProvider],
      services: [awsService1, awsService2],
    }

    const chooser = new AccountChooser(selections, oldSelections, filterOptions)
    const result = chooser['chooseServices']()
    // Should add all GCP services
    expect(Array.from(result)).toEqual([gcpService1])
  })
})
