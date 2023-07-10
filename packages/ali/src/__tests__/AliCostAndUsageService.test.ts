/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CCFConfig,
  EstimationResult,
  GroupBy,
  setConfig,
} from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  MemoryEstimator,
  NetworkingEstimator,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'
import { ALI_CLOUD_CONSTANTS } from '../domain'
import { AliCostAndUsageService } from '../lib'

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
}))

const getUsageSpy = jest.spyOn(AliCostAndUsageService.prototype, 'getUsage')

const DEFAULT_CONFIG: CCFConfig = {
  ALI: {
    NAME: 'AliCloud',
    authentication: {
      accessKeyId: 'id',
      accessKeySecret: 'secret',
    },
  },
}

describe('Ali Cost And Usage Service', () => {
  const startDate = new Date('2020-11-02')
  const endDate = new Date('2020-11-07')
  const grouping: GroupBy = GroupBy.day
  const billAccountName = 'accountName'
  const billAccountID = 'id'
  beforeEach(() => {
    ALI_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT = {
      total: {},
    }

    setConfig(DEFAULT_CONFIG)
  })

  it('Returns estimates for Compute', async () => {
    ;(getUsageSpy as jest.Mock).mockResolvedValue({
      body: {
        data: {
          totalCount: 2,
          items: [
            {
              billAccountID: billAccountID,
              billAccountName: billAccountName,
              servicePeriod: '12',
              servicePeriodUnit: '月',
              productCode: 'ecs',
              instanceConfig:
                'I/O 优化实例:I/O例;操作系统位数:64位;实例规格族:ecs.g7;systemdisk_delete_with_instance:true;实例规格:2核 8G;操作系统的类型:Linux;体检服务:是;地域:亚太东南 1 (新加坡);可用区:随机分配;CPU:2核;系统;实例系列:ecs-6;操作系统:aliyun_3_x64_20G_alibase_20230110.vhd;内存:8GBMB;是否是按流量计费:按固定带宽;挂载点:/dev/xvda;带宽:5120Kbps;管家服务:是',
              instanceSpec: 'ecs.g7.large',
              region: '西南1（成都）',
              cashAmount: 0,
            },
          ],
        },
      },
    })
    const aliCostAndUsageService = new AliCostAndUsageService(
      new ComputeEstimator(),
      new StorageEstimator(ALI_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(ALI_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(ALI_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(ALI_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(ALI_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        ALI_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
    )
    const result = await aliCostAndUsageService.getEstimates(
      startDate,
      endDate,
      grouping,
    )
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 108.87606106987849,
            co2e: 0.0709087968618621,
            usesAverageCPUConstant: false,
            cloudProvider: 'AliCloud',
            accountId: billAccountID,
            accountName: billAccountName,
            serviceName: 'ecs',
            cost: 0,
            region: '西南1（成都）',
          },
        ],
        groupBy: grouping,
      },
    ]
    expect(result).toEqual(expectedResult)
  })
})
