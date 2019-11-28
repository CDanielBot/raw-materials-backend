import { Router, Request, Response, NextFunction } from 'express'
import * as admin from 'firebase-admin'
import * as firebase from 'firebase'
import axios from 'axios'
import * as config from '../../config'
import {
  AuthUserResp, CreateUserResp, RegisterNewAccountReq,
  UserCredentials, FilterUsers, UpdateUserReq
} from './HttpTypes'
import Company from '../company/Company'
import UserAccount from '../userAccount/UserAccount'

export class UsersRouter {
  router: Router

  constructor() {
    this.router = Router()
    this.init()
  }

  init() {
    this.router.get('/', this.filter)
    this.router.post('/register', this.registerNewAccount)
    this.router.post('/updatePassword', this.updatePassword)
    this.router.post('/signOut', this.signOut)
    this.router.post('/authenticate', this.signIn)
  }

  public filter = async (req: Request, res: Response) => {
    try {
      const filterUsers: FilterUsers = req.query
      const allUsersList: Array<admin.auth.UserRecord> = await this.getUsers([], undefined)
      if (filterUsers.ids && filterUsers.ids.length > 0) {
        const users = []
        for (const user of allUsersList) {
          for (const id of filterUsers.ids) {
            if (user.uid === id) {
              users.push(user)
            }
          }
        }
        res.status(200).json(users)
      }
      res.status(200).json(allUsersList)
    } catch (error) {
      console.log('Error listing users:', error)
      res.status(500).json(error)
    }
  }


  public signIn = async (req: Request, res: Response) => {
    try {
      const credentials: UserCredentials = req.body.user
      const user: firebase.auth.UserCredential = await firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
      const token: string = await user.user.getIdToken()
      const userAccount: UserAccount = await this.getUserAccount(user.user.uid)
      res.status(200).json(new AuthUserResp(token, user.user, userAccount))
    } catch (error) {
      res.status(401).json(error)
    }
  }

  public async signOut(req: Request, res: Response) {
    try {
      await firebase.auth().signOut()
      res.status(200).send()
    } catch (error) {
      res.status(500).json(error)
    }
  }

  public registerNewAccount = async (req: Request, res: Response) => {
    try {
      const registerNewAccountReq = new RegisterNewAccountReq(req.body.user, req.body.company)
      const userRecordEntity: admin.auth.UserRecord = await admin.auth().createUser(registerNewAccountReq.toFirebaseUser())
      const userAccountEntity = registerNewAccountReq.toUserAccount(userRecordEntity.uid)
      const userAccountId = await this.createUserAccount(userAccountEntity)
      const companyEntity = registerNewAccountReq.toCompany(userRecordEntity.uid)
      const companyId = await this.createCompany(companyEntity)
      const response = new CreateUserResp(userRecordEntity.uid, userRecordEntity.email, userAccountId,
        companyId, userAccountEntity.userType)
      res.status(200).json(response)
    } catch (error) {
      console.log('error is : ' + error)
      res.status(500).json(error)
    }
  }

  private getUserAccount = async (userId: string): Promise<UserAccount> => {
    const result = await axios.get(`${config.baseUrl}/api/v1/userAccounts`, {
      params: {
        userId: userId
      }
    })
    return Promise.resolve(result.data[0])
  }

  private async createUserAccount(userAccount: UserAccount): Promise<string> {
    const result = await axios.post(`${config.baseUrl}/api/v1/userAccounts`, {
      userAccount: userAccount
    })
    return result.data
  }

  private async createCompany(company: Company): Promise<string> {
    const result = await axios.post(`${config.baseUrl}/api/v1/companies`, {
      company: company
    })
    return result.data

  }

  public async updatePassword(req: Request, res: Response) {
    try {
      const updateRequest: UpdateUserReq = new UpdateUserReq(req.body.user)

      // TODO -> uncomment code when firebase token is sent from client
      // const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(req.body.token)
      // if (decodedToken.uid !== userIdToUpdate) {
      //   // TODO -> Check if the user is app administrator and allow if so
      //   throw { code: 'auth/missing-roles', message: 'You do not have the rights to update user: ' + userIdToUpdate }
      // }
      try {
        const firebaseCredentials = firebase.auth.EmailAuthProvider.credential(updateRequest.user.email, updateRequest.user.oldPassword)
        await firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(firebaseCredentials)
      } catch (error) {
        throw { code: 'auth/invalid-old-password', message: 'The specified password is not correct' }
      }
      const userRecord: admin.auth.UserRecord = await admin.auth().updateUser(updateRequest.user.userId, updateRequest.toAuthUpdateRequest())
      res.status(200).json({ message: 'User updated successfully' })
    } catch (error) {
      res.status(400).json(error)
    }
  }

  private async getUsers(usersList: Array<admin.auth.UserRecord>, nextPageToken: string): Promise<Array<admin.auth.UserRecord>> {
    const listUsersResult: admin.auth.ListUsersResult = await admin.auth().listUsers(1000, nextPageToken)
    usersList.push.apply(usersList, listUsersResult.users)
    if (listUsersResult.pageToken) {
      // List next batch of users.
      return this.getUsers(usersList, listUsersResult.pageToken)
    }
    return Promise.resolve(usersList)
  }

}

// Create the UsersRouter, and export its configured Express.Router
export default new UsersRouter().router