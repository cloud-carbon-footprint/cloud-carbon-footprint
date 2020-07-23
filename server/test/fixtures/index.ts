import AWS from 'aws-sdk'

export const s3MockResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 's3Size',
      Label: 's3Size',
      Timestamps: [new Date('2020-06-27T00:00:00.000Z')],
      Values: [2586032500],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
}

export const elastiCacheMockResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 'cpuUtilization',
      Label: 'AWS/ElastiCache CPUUtilization',
      Timestamps: [new Date('2020-07-19T22:00:00.000Z'), new Date('2020-07-20T23:00:00.000Z')],
      Values: [1.0456, 2.03242],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'vCPUs',
      Label: 'AWS/Usage Standard/OnDemand vCPU EC2 Resource ResourceCount',
      Timestamps: [],
      Values: [],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
}

export const ec2MockResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-01914bfb56d65a9ae CPUUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [22.983333333333334, 31.435897435897434],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [11.566666666666666, 24.25],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'vCPUs',
      Label: 'AWS/Usage Standard/OnDemand vCPU EC2 Resource ResourceCount',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [4, 4.5],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [1000000, 9999999],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
  Messages: [],
}

export const elastiCacheMockDescribeCacheClusters: AWS.ElastiCache.CacheClusterMessage = {
  CacheClusters: [
    {
      AtRestEncryptionEnabled: false,
      AuthTokenEnabled: false,
      AutoMinorVersionUpgrade: true,
      CacheClusterCreateTime: new Date('2020-07-21T19:08:34.506Z'),
      CacheClusterId: 'balu-redis',
      CacheClusterStatus: 'available',
      CacheNodeType: 'cache.t3.medium',
      CacheNodes: [],
      CacheParameterGroup: {
        CacheNodeIdsToReboot: [],
        CacheParameterGroupName: 'default.redis5.0',
        ParameterApplyStatus: 'in-sync',
      },
      CacheSecurityGroups: [],
      CacheSubnetGroupName: 'redis-subnet-group',
      ClientDownloadLandingPage: 'https://console.aws.amazon.com/elasticache/home#client-download:',
      Engine: 'redis',
      EngineVersion: '5.0.6',
      NumCacheNodes: 1,
      PendingModifiedValues: {},
      PreferredAvailabilityZone: 'us-east-2a',
      PreferredMaintenanceWindow: 'wed:05:00-wed:06:00',
      SecurityGroups: [{ SecurityGroupId: 'sg-089fe61dac048189c', Status: 'active' }],
      SnapshotRetentionLimit: 0,
      SnapshotWindow: '23:00-00:00',
      TransitEncryptionEnabled: false,
    },
    {
      AtRestEncryptionEnabled: false,
      AuthTokenEnabled: false,
      AutoMinorVersionUpgrade: true,
      CacheClusterCreateTime: new Date('2020-07-21T20:56:11.741Z'),
      CacheClusterId: 'small-redis-dummy',
      CacheClusterStatus: 'available',
      CacheNodeType: 'cache.t3.micro',
      CacheNodes: [],
      CacheParameterGroup: {
        CacheNodeIdsToReboot: [],
        CacheParameterGroupName: 'default.redis5.0',
        ParameterApplyStatus: 'in-sync',
      },
      CacheSecurityGroups: [],
      CacheSubnetGroupName: 'balu-subnet-group',
      ClientDownloadLandingPage: 'https://console.aws.amazon.com/elasticache/home#client-download:',
      Engine: 'redis',
      EngineVersion: '5.0.6',
      NumCacheNodes: 1,
      PendingModifiedValues: {},
      PreferredAvailabilityZone: 'us-east-2a',
      PreferredMaintenanceWindow: 'sun:04:30-sun:05:30',
      SecurityGroups: [{ SecurityGroupId: 'sg-211c765b', Status: 'active' }],
      SnapshotRetentionLimit: 0,
      SnapshotWindow: '23:30-00:30',
      TransitEncryptionEnabled: false,
    },
  ],
}

export const ebsMockResponse: AWS.CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      Estimated: false,
      Groups: [],
      TimePeriod: {
        End: '2020-06-28',
        Start: '2020-06-27',
      },
      Total: {
        UsageQuantity: {
          Amount: '1.0',
          Unit: 'GB-Month',
        },
      },
    },
    {
      Estimated: false,
      Groups: [],
      TimePeriod: {
        End: '2020-06-29',
        Start: '2020-06-28',
      },
      Total: {
        UsageQuantity: {
          Amount: '2.0',
          Unit: 'GB-Month',
        },
      },
    },
  ],
}
