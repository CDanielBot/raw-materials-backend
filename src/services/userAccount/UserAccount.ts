import Entity from '../crud/Entity'

export default interface UserAccount extends Entity {
    name?: string
    phoneNumber?: string
    userType?: string
    userId: string
    // TODO -> add extra information when needed
}