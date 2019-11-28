/**
 * Model to be used when asking for a price offer
 */
export interface AskPriceRequest {
    productId: string
    userId: string
    messageContent: string
}

/**
 * Model to be used when sending messages to chat
 */
export interface MessageRequest {
    roomId: string
    senderId: string
    receiverId: string
    title: string
    content: string
    read: boolean
}

/**
 * Model to be used when retrieving rooms for either a seller or a buyer
 */
export interface FilterRooms {
    /**
     * Either ownerId or askerId
     * Use ownerId when retrieving room chats for a seller
     * Use askerId when retrieving room chats for a buyer
     */
    ownerId: string
    askerId: string
}

export interface RoomIdParam {
    roomId: string
}