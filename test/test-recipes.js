const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('recipes', function() {
    before(function(){
        return runServer();
    });
    after(function(){
        return closeServer();
    });
    it('should list recipes on Get', function() {
        return chai.request(app)
        .get('/recipes')
        .then(function(res){
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body.length).to.be.above(0);
            res.body.forEach(function(item) {
                expect(item).to.be.a('object');
                expect(item).to.have.all.keys(
                    'name', 'ingredients', 'id');
            });
        });
    });
    it('should add an item on POST', function() {
        const newItem = {name: 'coffee', ingredients: 'sugar, creamer'};
        return chai.request(app)
        .post('/recipes')
        .send(newItem)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'name', 'ingredients');
            expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
        });
    });
    it('should update items on PUT', function() {
        const updateData = {
            name: 'ribs',
            ingredients: ['bbq sauce', 'corn']
        };
        return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
            .put(`/recipes/{${updateData.id}`)
            .send(updateData)
        })
        .then(function(res) {
            res.should.have.status(204);
        });
    });
    it('should delete items on DELETE', function() {
        return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            return chai.request(app)
            .delete(`/recipes/${res.body[0].id}`);
        })
        .then(function(res) {
            expect(res).to.have.status(204);
        });
    });
});