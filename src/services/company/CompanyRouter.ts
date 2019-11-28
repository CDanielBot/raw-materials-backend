import { Router, Request, Response } from 'express'
import Company from './Company'
import { CompanyIdParam } from './HttpTypes'
import FilterByUser from '../crud/FilterByUser'
import FirebaseCrudOperations from '../crud/FirebaseCrudOperations'
import * as firebase from 'firebase'
import * as _ from 'lodash'

export class CompanyRouter {
    router: Router
    crud: FirebaseCrudOperations<Company>

    constructor() {
        this.router = Router()
        this.crud = new FirebaseCrudOperations('/companies')
        this.init()
    }

    init() {
        this.router.get('/', this.filter)
        this.router.get('/:companyId', this.get)
        this.router.put('/:companyId', this.update)
        this.router.delete('/:companyId', this.delete)
        this.router.post('/', this.create)
    }

    public get = async (req: Request, res: Response) => {
        const companyIdParam: CompanyIdParam = req.params
        try {
            const company = await this.crud.get(companyIdParam.companyId)
            res.status(200).json(company)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public filter = async (req: Request, res: Response) => {
        const filter: FilterByUser = req.query
        try {
            const data: Array<Company> = await this.crud.filter(filter)
            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }

    }

    public update = async (req: Request, res: Response) => {
        const companyIdParam: CompanyIdParam = req.params
        const companyUpdate: Company = req.body.company
        try {
            const updated = await this.crud.update(companyIdParam.companyId, companyUpdate)
            res.status(200).json(updated)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public delete = async (req: Request, res: Response) => {
        const companyIdParam: CompanyIdParam = req.params
        try {
            await this.crud.delete(companyIdParam.companyId)
            res.status(200).send()
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public create = async (req: Request, res: Response) => {
        const company: Company = req.body.company
        try {
            const companyId = this.crud.create(company)
            res.status(200).json(companyId)
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

export default new CompanyRouter().router