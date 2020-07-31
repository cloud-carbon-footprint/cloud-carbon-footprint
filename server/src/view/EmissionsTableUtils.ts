export interface Total {
  wattHours: number
  co2e: number
}

export type Totals = { [key: string]: Total }

export const initialTotals = () => ({
  ebs: {
    wattHours: 0,
    co2e: 0,
  },
  s3: {
    wattHours: 0,
    co2e: 0,
  },
  ec2: {
    wattHours: 0,
    co2e: 0,
  },
  elasticache: {
    wattHours: 0,
    co2e: 0,
  },
  rds: {
    wattHours: 0,
    co2e: 0,
  },
  total: {
    wattHours: 0,
    co2e: 0,
  },
})

export const displayServiceName = (serviceName: string): string => {
  const mapping: Record<string, string> = {
    ebs: 'EBS',
    s3: 'S3',
    ec2: 'EC2',
    elasticache: 'ElastiCache',
    rds: 'RDS',
    total: 'Total',
  }
  return mapping[serviceName]
}

export const displayWattHours = (wattHours: number) => wattHours.toFixed(2).toString()
export const displayCo2e = (co2e: number) => co2e.toFixed(6).toString()
