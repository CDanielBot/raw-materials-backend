process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server.ts')
let should = chai.should()
chai.use(chaiHttp);

describe('Material', () => {
    // beforeEach((done) => { //Before each test we empty the database
    // TODO
    // })
    const url = '/api/v1/materials'

    it('should GET all the materials', (done) => {
        chai.request(server)
            .get(url)
            .end((err, res) => {
                res.status.should.be.equal(200)
                res.body.should.be.a('array')
                res.body.length.should.be.eql(5)
                done()
            })
    })

    it('should get material by id', (done) => {
        chai.request(server)
            .get(url + '/m1' )
            .end((err, res) => {
                res.status.should.be.equal(200)
                res.body.should.be.a('object')
                res.body.id.should.be.equal('m1')
                done()
            })
    })
})