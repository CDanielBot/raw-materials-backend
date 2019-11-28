import Entity from '../crud/Entity'

interface CompanyInfo {
    description: string
    shortDescription: string
    certification: string
    services: {
        descriptions: Array<string>
    }
    faq: {
        customizedOrders: string
        freeSamples: string
        manufacturer: string
        minimumQuantity: string
        paymentType: string
    }
}

interface Location {
    address: string
    latitude: string
    longitude: string
}

interface Price {
    currency: string
    value?: string
    high?: string
    low?: string
}

interface SupplyAbility {
    period: string
    weight: string
    weightType: string
}

export default interface Material extends Entity {
    id?: string
    name?: string
    description?: string
    mainImage?: string
    userId?: string
    companyInfo?: CompanyInfo
    location?: Location
    minimumOrder?: string
    packaging?: string
    price?: Price
    supplyAbility?: SupplyAbility
}