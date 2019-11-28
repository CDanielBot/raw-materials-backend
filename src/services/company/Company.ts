import Entity from '../crud/Entity'

export default class Company {
    id?: string
    name?: string
    description?: string
    userId?: string
    companyType: string
    mainImage?: string
    registrationCode?: string
    licenseNumber?: string
    website?: string
    businessType?: string
    yearOfEstablishment?: number
    certifications?: Array<string>
    numberOfEmployees?: {
        low: number
        high: number
    }
    address?: {
        country?: string
        region?: string
        county?: string
        city?: string
        street?: string
    }
    payment?: {
        acceptedTypes?: Array<string>
        acceptedCurrencies?: Array<string>
        acceptedDelivery?: Array<string>
    }
}