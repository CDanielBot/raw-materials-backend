import { Router, Request, Response } from 'express'
import UserAccount from './UserAccount'
import { UserIdParam } from './HttpTypes'
import FilterByUser from '../crud/FilterByUser'
import FirebaseCrudOperations from '../crud/FirebaseCrudOperations'
import * as firebase from 'firebase'
import * as _ from 'lodash'

export class UserAccountRouter {
    router: Router
    crud: FirebaseCrudOperations<UserAccount>

    constructor() {
        this.router = Router()
        this.crud = new FirebaseCrudOperations('/userAccounts')
        this.init()
    }

    init() {
        this.router.get('/', this.filter)
        this.router.get('/:userId', this.get)
        this.router.put('/:userId', this.update)
        this.router.delete('/:userId', this.delete)
        this.router.post('/', this.create)
    }

    public get = async (req: Request, res: Response) => {
        const userIdParam: UserIdParam = req.params
        try {
            const userAccount = await this.crud.get(userIdParam.userId)
            res.status(200).json(userAccount)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public filter = async (req: Request, res: Response) => {
        const filter: FilterByUser = req.query
        const data: Array<UserAccount> = await this.crud.filter(filter)
        res.status(200).json(data)
    }

    public update = async (req: Request, res: Response) => {
        const userIdParam: UserIdParam = req.params
        const userAccount: UserAccount = req.body.userAccount
        try {
            const updated = await this.crud.update(userIdParam.userId, userAccount)
            res.status(200).json(updated)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public delete = async (req: Request, res: Response) => {
        const userIdParam: UserIdParam = req.params
        try {
            await this.crud.delete(userIdParam.userId)
            res.status(200).send()
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public create = async (req: Request, res: Response) => {
        const userAccount: UserAccount = req.body.userAccount
        try {
            const userAccountId = await this.crud.create(userAccount)
            res.status(200).json(userAccountId)
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

export default new UserAccountRouter().router