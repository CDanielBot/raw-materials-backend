# core

Backend API

The server is running on port 3001 by default.

To run the server in dev mode (with watchers on code changes) do: npm run watch

To compile the code and start without watchers, do: npm start



<h1> API calls </h1>

<h2> User management </h2>
METHOD          URL                              PARAMS
GET         /api/v1/users                   query params: ids: Array<string>

POST        /api/v1/users                   body params: {user: {credentials: {email: string, password: string},userAccount: {userType: string(BUYER/SELLER), name: string}}}

POST        /api/v1/users/updatePassword    body params: {user: {email: string, oldPassword: string, newPassword: string, userId: string}}

POST        /api/v1/users/authenticate      body params: {user: {email: string, password: string}}

POST        /api/v1/users/signOut


<h2> User account management </h2>
METHOD          URL                                     PARAMS
GET         /api/v1/userAccounts/:userId         path params: {userId}: string

GET         /api/v1/userAccounts                 query params: userId: string

POST        /api/v1/userAccounts                 body params: {userAccount: {userType: string(BUYER/SELLER), name: string}}

PUT         /api/v1/userAccounts/:userAccountId  body params: {userAccount: {userType: string(BUYER/SELLER), name: string}}

DELETE      /api/v1/userAccounts/:userAccountId 


<h2> Suggestions </h2>
METHOD          URL                                     PARAMS
GET         /api/v1/suggestions                 query params: suggestion: string


<h2> Material management </h2>
METHOD          URL                                     PARAMS
GET         /api/v1/materials/:productId        path params: productId: string

GET         /api/v1/materials                   query params: suggestion: string OR userId: string

(accepted Content-Type: multipart/form-data)
POST        /api/v1/materials                   body params: mainImage: filename.png, product: stringified  object of type Material.ts

PUT         /api/v1/materials/:productId        path params: productId: string
                                                body params: {product: Materials.ts}

DELETE      /api/v1/materials/:productId        path params: productId: string
       

<h2> Companies management </h2>
METHOD          URL                                     PARAMS
GET         /api/v1/companies:companyId         path params: companyId: string

GET         /api/v1/companies                   query params: userId: string

POST        /api/v1/companies                   body params: {company: Company.ts}

PUT         /api/v1/companies/:companyId        path params: companyId
                                                body params: {company: Company.ts}

DELETE      /api/v1/companies/:companyId                                                


<h2> Chat & messeges </h2>
METHOD          URL                                     PARAMS
GET         /api/v1/chatRooms                   query params: ownerId: string or askerId: string

GET         /api/v1/chatRooms/:roomId/message   path params: roomId: string

POST        /api/v1/chatRooms                   body params: {message: {roomId: string, senderId: string, receiverId: string, title: string, content: string, read: boolean}}

POST        /api/v1/chatRooms/askPrice          body params: {message: { productId: string, userId: string, messageContent: string}}