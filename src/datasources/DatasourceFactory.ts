import EbsDatasource from './EbsDatasource'
import Datasource from '../domain/Datasource'

export class DatasourceFactory {
  static create(): Datasource {
    return new EbsDatasource()
  }
}
