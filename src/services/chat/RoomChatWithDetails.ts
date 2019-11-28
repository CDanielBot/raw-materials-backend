import RoomChat from './RoomChat'
import Material from '../material/Material'
import Message from './Message'
import * as admin from 'firebase-admin'

export default class RoomChatWithDetails {

    id: string
    material: Material
    user: admin.auth.UserRecord
    message: Message

    constructor(room: RoomChat, material: Material, user: admin.auth.UserRecord) {
        this.id = room.id
        this.material = material
        this.user = user
        const firstKey = Object.keys(room.messages)[0]
        this.message = room.messages[firstKey]
    }
}