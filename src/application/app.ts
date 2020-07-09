import StorageEstimator from '../domain/StorageEstimator'
import EbsDatasource from '../datasources/EbsDatasource'
import FootprintEstimator from '../domain/FootprintEstimator'

//inputs
const startDate = new Date('2020-06-24')
const endDate = new Date('2020-06-27')
const provider = 'aws'

function getEstimations(startDate, endDate, services) {
  const datasource: StorageDatasource = StorageSourceFactory.create(provider, 'ebs')
  const data: StorageUsage[] = await datasource.getUsage(startDate, endDate)
  const storageEstimator: FootprintEstimator = new StorageEstimator(data)
}
