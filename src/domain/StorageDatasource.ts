export default interface StorageDatasource {
  getUsage(start: Date, end: Date): Promise<StorageUsage[]>
}
