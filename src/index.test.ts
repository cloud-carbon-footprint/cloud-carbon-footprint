import App from './index'
import Controller from './controller'

describe('App', () => {
    it('should have a Controller', () => {
        expect(App().controller).toBeInstanceOf(Controller)
    })
})
