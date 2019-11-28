import EntitiesMapping from '../crud/EntitiesMapping'
import Message from './Message'

export default interface RoomChat {
    id: string
    productId: string
    ownerId: string
    askerId: string
    messages?: EntitiesMapping<Message>
}