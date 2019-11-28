import { Router, Request, Response } from 'express'
import RoomChat from './RoomChat'
import {
    AskPriceRequest, MessageRequest,
    FilterRooms, RoomIdParam
} from './HttpTypes'
import SharedServices from '../shared/SharedServices'
import FirebaseCrudOperations from '../crud/FirebaseCrudOperations'
import Material from '../material/Material'
import Message from './Message'
import RoomChatWithDetails from './RoomChatWithDetails'
import EntitiesMapping from '../crud/EntitiesMapping'
import * as admin from 'firebase-admin'

export class MessageRouter {

    router: Router
    private crud: FirebaseCrudOperations<RoomChat>

    constructor() {
        this.router = Router()
        this.init()
        this.crud = new FirebaseCrudOperations<RoomChat>('/rooms')
    }

    init() {
        this.router.post('/', this.sendMessage)
        this.router.post('/askOffer', this.askOffer)
        this.router.get('/', this.filterRoomChats)
        this.router.get('/:roomId/messages', this.getMessagesForRoom)
    }

    private getMessageCrud(roomId: string) {
        return new FirebaseCrudOperations<Message>(`/rooms/${roomId}/messages`)
    }

    public filterRoomChats = async (req: Request, res: Response) => {
        const filter: FilterRooms = req.query

        if (!filter.askerId && !filter.ownerId) {
            res.status(400).send('Missing filter')
        }
        try {

            let rooms = []
            let uniqueUserIds = []
            if (filter.askerId) {
                rooms = await this.crud.filterByKey('askerId', filter.askerId)
                uniqueUserIds = [...new Set(rooms.map((room: RoomChat) => room.ownerId))]
            } else {
                rooms = await this.crud.filterByKey('ownerId', filter.ownerId)
                uniqueUserIds = [...new Set(rooms.map((room: RoomChat) => room.askerId))]
            }

            const sharedServices = new SharedServices()
            const users = await sharedServices.getUsersByIds(uniqueUserIds)
            const usersMapping: EntitiesMapping<admin.auth.UserRecord> = {}
            for (const user of users) {
                usersMapping[user.uid] = user
            }

            const uniqueProductIds = [...new Set(rooms.map((room: RoomChat) => room.productId))]
            // TODO -> move to shared services or rest call
            const productsMapping = await new FirebaseCrudOperations<Material>('/materials').getByIds(uniqueProductIds)

            rooms = rooms.map((room: RoomChat) => {
                return new RoomChatWithDetails(room,
                    productsMapping[room.productId],
                    filter.askerId ? usersMapping[room.ownerId] : usersMapping[room.askerId])
            })

            res.status(200).json(rooms)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public getMessagesForRoom = async (req: Request, res: Response) => {
        const roomIdParam: RoomIdParam = req.params
        try {
            const messages = await this.getMessageCrud(roomIdParam.roomId).getAll()
            res.status(200).json(messages)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    public sendMessage = async (req: Request, res: Response) => {
        const message: MessageRequest = req.body.message
        const messageEntity = new Message(message.roomId, message.title, message.content, message.senderId, message.receiverId)
        const messageId = await this.getMessageCrud(message.roomId).create(messageEntity)
        res.status(200).send(messageId)
    }

    public askOffer = async (req: Request, res: Response) => {
        const request: AskPriceRequest = req.body.message

        try {
            const sharedServices = new SharedServices()
            const material = await sharedServices.getMaterial(request.productId)
            const roomId = material.id + '_' + request.userId

            let room = await this.crud.get(roomId)
            if (!room) {
                room = await this.crud.createWithId({ id: roomId, productId: material.id, ownerId: material.userId, askerId: request.userId })
            }

            const message = new Message(room.id, 'Asking for price offer', request.messageContent, request.userId, material.userId)
            const messageId = await this.getMessageCrud(message.roomId).create(message)

            res.status(200).send(messageId)
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    }

}

export default new MessageRouter().router