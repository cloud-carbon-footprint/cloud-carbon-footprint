import Controller from './controller'
import AwsClient from './AwsClient'
import * as AWS from 'aws-sdk'

const costExplorer: AWS.CostExplorer = new AWS.CostExplorer({
  region: 'us-east-1'
})
const client: AwsClient = new AwsClient(costExplorer)
const controller = new Controller('myController', client)

export interface App {
  controller: Controller
}
export default (): App => ({controller: controller })
