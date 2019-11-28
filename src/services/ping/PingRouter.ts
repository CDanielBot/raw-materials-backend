import { Router, Request, Response } from 'express'

export class PingRouter {
    router: Router

    constructor() {
        this.router = Router()
        this.router.get('/', (req: Request, res: Response) => {
            res.status(200).send('Service is wor')
        })
    }

}

export default new PingRouter().router