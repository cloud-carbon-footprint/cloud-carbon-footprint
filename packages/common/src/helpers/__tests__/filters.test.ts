import { buildAccountFilter, getAccountIdsFromList } from '../filters'
import { AccountDetailsOrIdList } from '../../Types'

describe('filter helpers', () => {
  describe('getAccountIdsFromList', () => {
    it('should return an array of account IDs when passed an array of account IDs', () => {
      const accounts = ['id1', 'id2', 'id3']
      const result = getAccountIdsFromList(accounts)
      expect(result).toEqual(['id1', 'id2', 'id3'])
    })

    it('should return an array of account IDs when passed an array of account objects', () => {
      const accounts = [
        { id: 'id1' },
        { id: 'id2', name: 'account-name-2' },
        { id: 'id3' },
      ]
      const result = getAccountIdsFromList(accounts)
      expect(result).toEqual(['id1', 'id2', 'id3'])
    })

    it('should ignore objects that do not have an id property', () => {
      const accounts = [{ notId: 'id1' }, { id: 'id2' }]
      const result = getAccountIdsFromList(
        accounts as unknown as AccountDetailsOrIdList,
      )
      expect(result).toEqual(['id2'])
    })

    it('should throw an error when passed a non-array', () => {
      const accounts = 'not an array'
      expect(() =>
        getAccountIdsFromList(accounts as unknown as AccountDetailsOrIdList),
      ).toThrowError(
        'List must be a valid array of IDs or objects containing account details',
      )
    })
  })

  describe('buildAccountFilter', () => {
    const columnName = 'account_id'
    it('should return a formatted string of account IDs when passed an array of account IDs and a column name', () => {
      const accounts: AccountDetailsOrIdList = ['id1', 'id2', 'id3']
      const result = buildAccountFilter(accounts, columnName)
      expect(result).toEqual(`AND ${columnName} IN ('id1', 'id2', 'id3')`)
    })

    it('should return a formatted string of account IDs when passed an array of account objects and a column name', () => {
      const accounts: AccountDetailsOrIdList = [
        { id: 'id1' },
        { id: 'id2', name: 'account-name-2' },
        { id: 'id3' },
      ]
      const result = buildAccountFilter(accounts, columnName)
      expect(result).toEqual(`AND ${columnName} IN ('id1', 'id2', 'id3')`)
    })

    it('should return an empty string when passed an empty array and a column name', () => {
      const accounts: AccountDetailsOrIdList = []
      const result = buildAccountFilter(accounts, columnName)
      expect(result).toEqual('')
    })
  })
})
