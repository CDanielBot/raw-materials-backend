import * as admin from 'firebase-admin'
import Material from '../material/Material'
import axios from 'axios'
import * as config from '../../config'

export default class SharedServices {
    constructor() {
    }

    public getUser(token: string): Promise<admin.auth.DecodedIdToken> {
        return new Promise<admin.auth.DecodedIdToken>(async (resolve, reject) => {
            const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token)
            return Promise.resolve(decodedToken)
        })
    }

    public getMaterial(productId: string): Promise<Material> {
        return axios.get(`${config.baseUrl}/api/v1/materials/${productId}`).then((result: any) => {
            return Promise.resolve(result.data)
        })
    }

    public getUsersByIds(userIds: Array<string>): Promise<Array<admin.auth.UserRecord>> {
        return axios.get(`${config.baseUrl}/api/v1/users`, { params: { ids: userIds } }).then((result: any) => {
            return Promise.resolve(result.data)
        })
    }
}