import { Router, Request, Response } from 'express'
import * as firebase from 'firebase'
import * as admin from 'firebase-admin'
import * as _ from 'lodash'
import * as fs from 'fs'
import Material from './Material'
import * as Storage from '@google-cloud/storage'
import { FilterReq, ProductIdParam, FileUploadRequest } from './HttpTypes'
import FirebaseCrudOperations from '../crud/FirebaseCrudOperations'
const fse = require('fs-extra')

export class MaterialRouter {
    router: Router
    crud: FirebaseCrudOperations<Material>

    constructor() {
        this.router = Router()
        this.crud = new FirebaseCrudOperations<Material>('/materials')
        this.init()
    }

    init() {
        this.router.get('/', this.filter)
        this.router.get('/:productId', this.get)
        this.router.put('/:productId', this.update)
        this.router.delete('/:productId', this.delete)
        this.router.post('/', this.create)
    }

    public get = async (req: Request, res: Response) => {
        const productIdParam: ProductIdParam = req.params
        try {
            const product = await this.crud.get(productIdParam.productId)
            res.status(200).json(product)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public filter = async (req: Request, res: Response) => {
        const request: FilterReq = req.query
        let filteredData: Array<Material> = await this.crud.filter({ userId: request.userId })
        const suggestion: string = request.suggestion
        if (suggestion && suggestion.trim().length > 0) {
            filteredData = filteredData.filter((material: Material) => {
                return material.name.toLowerCase().includes(suggestion)
                    || material.description.toLowerCase().includes(suggestion)
                    || (material.companyInfo && material.companyInfo.description.toLowerCase().includes(suggestion))
            })
        }
        res.status(200).json(filteredData)
    }

    public update = async (req: Request, res: Response) => {
        const productIdParam: ProductIdParam = req.params
        const productUpdate: Material = req.body.product
        try {
            await this.crud.update(productIdParam.productId, productUpdate)
            const updatedProduct = await this.crud.get(productIdParam.productId)
            res.status(200).json(updatedProduct)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public delete = async (req: Request, res: Response) => {
        const productIdParam: ProductIdParam = req.params
        try {
            await this.crud.delete(productIdParam.productId)
            res.status(200).send()
        } catch (error) {
            res.status(500).json(error)
        }
    }

    /**
     * Send the request with header: Content-Type: multipart/form-data
     * The request body should contain 2 keys:
     *  1. product - it maps to the stringified json of the product to be added
     *  2. mainImage - the image to be used as main image of the product
     * I consider extending this service to v2 - receive multiple images for one product
     */
    public create = async (req: FileUploadRequest, res: Response) => {
        try {
            const product: Material = JSON.parse(req.body.product)
            const productId: string = await this.crud.create(product)


            if (req.files) {
                const image: any = req.files.mainImage
                if (!image) {
                    throw 'You must send the product main image with the key: mainImage'
                }
                const imagePath = await this.saveImageTemporary(image, productId)
                const imageUrl = await this.uploadImageToCloud(imagePath, productId)
                await this.removeImage(imagePath)
                await this.crud.update(productId, { mainImage: imageUrl })
            }

            const newProduct = await this.crud.get(productId)
            res.status(200).json(newProduct)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    private async uploadImageToCloud(imagePath: string, productId: string): Promise<string> {
        const bucket = admin.storage().bucket('raw-materials-5e631.appspot.com')
        const files: [Storage.File] = await bucket.upload(imagePath, {
            destination: `materials/mainImages/${productId}.jpg`,
            public: true
        })
        const file = files[0]
        const signedUrls: Array<string> = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        })
        return Promise.resolve(signedUrls[0])
    }

    private saveImageTemporary(image: any, productId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const path: string = `tmp/${productId}.jpg`
            fse.outputFile(path, image.data, (error: any) => {
                if (error) {
                    reject(error)
                }
                resolve(path)
            })
        })
    }

    private removeImage(imagePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(imagePath, (error) => {
                if (error) {
                    reject(error)
                }
                resolve()
            })
        })
    }

}

export default new MaterialRouter().router