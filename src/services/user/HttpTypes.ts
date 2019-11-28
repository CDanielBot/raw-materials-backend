import * as admin from 'firebase-admin'
import UserAccount from '../userAccount/UserAccount'
import Company from '../company/Company'

export class AuthUserResp {

    public userId: string
    public userType: string
    public token: string

    constructor(private _token: string, private user: firebase.User, private userAccount: UserAccount) {
        this.token = _token
        this.userId = user.uid
        this.userType = userAccount.userType
        delete this._token
        delete this.user
        delete this.userAccount
    }
}

export interface FilterUsers {
    ids: Array<string>
}

export interface FirebaseUser {
    email: string
    displayName: string
    emailVerified: boolean
    password: string
}

export class RegisterNewAccountReq {
    constructor(public user: RegisterAccountUser, public company: RegisterAccountCompany) { }

    toUserAccount(userId: string): UserAccount {
        return {
            userType: this.user.accountType,
            name: this.user.firstName + ' ' + this.user.lastName,
            phoneNumber: this.user.phoneNumber,
            userId: userId
        }
    }

    toCompany(userId: string): Company {
        return {
            name: this.company.companyName,
            companyType: this.user.accountType,
            registrationCode: this.company.fiscalCode,
            licenseNumber: this.company.licenseNumber,
            yearOfEstablishment: this.company.yearFounded,
            userId: userId
        }
    }

    toFirebaseUser(): FirebaseUser {
        return {
            email: this.user.email,
            displayName: this.user.email,
            emailVerified: false,
            password: this.user.password
        }
    }
}

interface RegisterAccountUser {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    accountType: string
}

interface RegisterAccountCompany {
    fiscalCode: string
    companyName: string
    licenseNumber: string
    yearFounded: number
    address: string
}

export class UpdateUserReq {
    constructor(public user: UpdateUser) { }

    public toAuthUpdateRequest(): admin.auth.UpdateRequest {
        const result: admin.auth.UpdateRequest = {}
        result.password = this.user.newPassword
        if (this.user.displayName) {
            result.displayName = this.user.displayName
        }
        if (this.user.phoneNumber) {
            result.phoneNumber = this.user.phoneNumber
        }
        if (this.user.disabled === true || this.user.disabled === false) {
            result.disabled = this.user.disabled
        }
        return result
    }
}

interface UpdateUser {
    email: string
    userId: string
    oldPassword: string
    newPassword: string
    displayName?: string
    emailVerified?: boolean
    phoneNumber?: string
    disabled?: boolean
}

export interface UserCredentials {
    email: string
    password: string
}

export class CreateUserResp {
    constructor(public userId: string, public email: string,
        public userAccountId: string, public companyId: string, public userType: string) { }
}