import Controller from './controller'

interface App {
    controller: Controller
}

let controller = new Controller('myController')

export default(): App => ({controller: controller })
