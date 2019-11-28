import * as moment from 'moment'
import Entity from '../crud/Entity'

export default class Message implements Entity {

    public createdAt: string
    public id?: string
    public read?: boolean

    constructor(public roomId: string, public title: string, public content: string,
        private senderId: string, private receiverId: string) {
        this.createdAt = moment().format()
        this.read = false
    }

}