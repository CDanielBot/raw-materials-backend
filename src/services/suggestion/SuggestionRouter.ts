import { Router, Request, Response, NextFunction } from 'express'
import * as firebase from 'firebase'
import Suggestion from './Suggestion'

export class SuggestionRouter {
    router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    init() {
        this.router.get('/', this.searchSuggestions)
    }


    public searchSuggestions(req: Request, res: Response) {
        const textToMatch: string = req.query.suggestion.toLowerCase()
        firebase.database().ref('/suggestions').on('value', snapshot => {
            const filteredData = snapshot.val().filter((suggestion: Suggestion) => {
                return suggestion.keyword.toLowerCase().includes(textToMatch)
            })
            res.status(200).json(filteredData)
        })
    }

}

export default new SuggestionRouter().router