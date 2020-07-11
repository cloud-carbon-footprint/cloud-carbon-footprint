import EbsDatasource from './EbsDatasource'

export class DatasourceFactory {
  static create(): EbsDatasource {
    return new EbsDatasource()
  }
}
