import * as express from 'express'
import * as admin from 'firebase-admin'
import * as firebase from 'firebase'
import UserRouter from './services/user/UserRouter'
import SuggestionRouter from './services/suggestion/SuggestionRouter'
import MaterialRouter from './services/material/MaterialRouter'
import MessageRouter from './services/chat/MessageRouter'
import { Request, Response, NextFunction } from 'express'
import CompanyRouter from './services/company/CompanyRouter'
import PingRouter from './services/ping/PingRouter'
import UserAccountRouter from './services/userAccount/UserAccountRouter'
const config = require('config')

const fileUpload = require('express-fileupload')
const accountKey = require('./private/rawMaterialsFirebaseKey.json')

class App {

  public app: express.Application

  constructor() {
    this.app = express()
    this.config()
    this.mountRoutes()
    this.initializeFirebase()
  }

  private config(): void {
    this.app.use(express.json())
    this.app.use(fileUpload())
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })
  }

  private initializeFirebase(): void {
    firebase.initializeApp({
      apiKey: config.get('apiKey'),
      authDomain: config.get('authDomain'),
      databaseURL: config.get('databaseURL'),
      projectId: config.get('projectId'),
      storageBucket: config.get('storageBucket'),
      messagingSenderId: config.get('messagingSenderId')
    })
    admin.initializeApp({
      credential: admin.credential.cert(accountKey),
      databaseURL: config.get('databaseURL')
    });
  }

  private mountRoutes(): void {
    this.app.use('/', PingRouter)
    this.app.use('/api/v1/users', UserRouter)
    this.app.use('/api/v1/userAccounts', UserAccountRouter)
    this.app.use('/api/v1/suggestions', SuggestionRouter)
    this.app.use('/api/v1/materials', MaterialRouter)
    this.app.use('/api/v1/chatRooms', MessageRouter)
    this.app.use('/api/v1/companies', CompanyRouter)
  }
}

export default new App().app