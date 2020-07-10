import EbsDatasource from '../datasources/EbsDatasource'

export class DatasourceFactory {
  static create() {
    return new EbsDatasource()
  }
}
