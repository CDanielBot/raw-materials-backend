import * as firebase from 'firebase'
import * as _ from 'lodash'
import FilterByUser from './FilterByUser'
import Entity from './Entity'
import EntitiesMapping from './EntitiesMapping'

export default class FirebaseCrudOperations<E extends Entity> {

    constructor(private baseUrl: string) {
    }

    private toUrl(id: string): string {
        return '/' + this.baseUrl + '/' + id
    }

    public create = async (entity: E): Promise<string> => {
        const productId: string = await firebase.database().ref(this.baseUrl).push(entity).key
        return productId
    }

    public createWithId = async (entity: E): Promise<E> => {
        return new Promise<E>((resolve, reject) => {
            firebase.database().ref(this.baseUrl).child(`${entity.id}`).set(entity, (error) => {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    resolve(entity)
                }
            })
        })
    }

    public get = (id: string): Promise<E> => {
        return new Promise<E>((resolve, reject) => {
            try {
                firebase.database().ref(this.toUrl(id)).on('value', snapshot => {
                    if (!snapshot.val()) {
                        resolve(undefined)
                    } else {
                        const entity: E = snapshot.val()
                        entity.id = id
                        resolve(entity)
                    }
                })
            } catch (error) {
                reject(error)
            }

        })
    }

    public getByIds = (ids: Array<string>): Promise<EntitiesMapping<Entity>> => {
        const getPromises = ids.map((id) => {
            return this.get(id)
        })
        return Promise.all(getPromises).then((entities: Array<Entity>) => {
            const object: EntitiesMapping<Entity> = {}
            for (const entity of entities) {
                object[entity.id] = entity
            }
            return Promise.resolve(object)
        })
    }

    public getAll = (): Promise<Array<E>> => {
        return new Promise<Array<E>>((resolve) => {
            firebase.database().ref(this.baseUrl).once('value', snapshot => {
                resolve(this.snapshotToArray(snapshot))
            })
        })
    }

    public filter = (request: FilterByUser): Promise<Array<E>> => {
        const ref: firebase.database.Reference = firebase.database().ref(this.baseUrl)
        let query: firebase.database.Query
        if (request.userId) {
            query = ref.orderByChild('userId').equalTo(request.userId)
        } else {
            query = ref.orderByChild('name').startAt('!').endAt('~')
        }
        return new Promise<Array<E>>((resolve) => {
            query.on('value', snapshot => {
                resolve(this.snapshotToArray(snapshot))
            })
        })
    }

    private snapshotToArray = (snapshot: firebase.database.DataSnapshot): Array<E> => {
        const data = snapshot.val()
        if (data) {
            return Object.keys(data).map((key) => {
                data[key].id = key
                return data[key]
            })
        }
        return []

    }

    public filterByKey = (key: string, value: any): Promise<Array<E>> => {
        const query = firebase.database().ref(this.baseUrl).orderByChild(key).equalTo(value)
        return new Promise<Array<E>>((resolve) => {
            query.on('value', snapshot => {
                resolve(this.snapshotToArray(snapshot))
            })
        })
    }

    public update = async (id: string, updateEntity: E) => {
        try {
            await firebase.database().ref(this.toUrl(id)).update(updateEntity)
            return Promise.resolve()
        } catch (error) {
            return Promise.reject()
        }
    }

    public delete = async (id: string) => {
        try {
            await firebase.database().ref(this.toUrl(id)).remove()
            return Promise.resolve()
        } catch (error) {
            return Promise.reject()
        }
    }



}