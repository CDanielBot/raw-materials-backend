import { Request } from 'express'

export interface FilterReq {
    suggestion: string
    offset?: number
    limit?: number
    userId?: string
}

export interface ProductIdParam {
    productId: string
}

export interface FileUploadRequest extends Request {
    files: any
}