/*
 * © 2023 Thoughtworks, Inc.
 */

import AliCalculateRow from '../lib/AliCalculateRow'
import { DescribeInstanceBillResponseBodyDataItems } from '@alicloud/bssopenapi20171214'

describe('Ali Calculate Row', () => {
  it('get results from getDataForRegions given ecs', async () => {
    const item = new DescribeInstanceBillResponseBodyDataItems()
    item.instanceConfig =
      'I/O 优化实例:I/O 优化实例;操作系统位数:64位;实例规格族:ecs.s6;systemdisk_delete_with_instance:true;实例规格:1核 4GB;操作系统的类型:Linux;体检服务:是;地域:成都region;可用区:可用区A;CPU:1核;系统盘种类:增强型SSD云盘;虚拟交换机:vsw-2vcwp5da90fk0ytcgrn5r;网络类型:专有网络;系统盘大小:50GB;系统盘性能level:PL0;实例系列:系列 V;操作系统:m-2vcg1zc8duf3fwq39n9q;内存:4GBMB;是否是按流量计费:按流量计费;挂载点:/dev/xvda;带宽:10240Kbps;管家服务:是'
    item.region = '西南1（成都）'
    item.instanceSpec = 'ecs.s6-c1m4.small'
    item.productCode = 'ecs'
    item.servicePeriod = '1'
    item.servicePeriodUnit = '月 '
    const row = new AliCalculateRow(item)
    expect(row.vCpuHours).toEqual(1)
    expect(row.region).toEqual('西南1（成都）')
    expect(row.seriesName).toEqual('ecs.s6-c1m4.small')
    expect(row.specificationFamily).toEqual('ecs.s6')
    expect(row.serviceName).toEqual('ecs')
  })
})
