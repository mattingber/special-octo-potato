import { findByQuery, findOneByQuery } from '../../../tests/seedUtils';
import { emptyDB } from '../../../tests/seedUtils';
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-mutable-exports */
import request from 'supertest';
import * as http from 'http';
import {app} from '../../../shared/infra/http/app'
import {startApp} from '../../../index';

let server: http.Server;
beforeAll(async () => {

    try {
        server = await startApp;
        await emptyDB()
    } catch (err) {}

    
});
afterAll(async () => {
    await server.close();
});


const entity = {
    firstName: "no",
    lastName: "s",
    entityType: "soldier",
    personalNumber: "6536548",
    serviceType: "hov"
}

describe('POST Entity ', () => {
    it('create a VALID entity ', (done) => {
        request(app)
            .post(`/api/entities`)
            .send(
                entity
            )
            .expect(200)
            .end(async (err :any, res : any) => {
                if (err) {
                    
                    throw done(err);
                }
                expect(Object.keys(res.body).length === 1)
                expect(res.body.id).toBeTruthy()
                const foundGroup = await findOneByQuery('entities', { firstName: "no"})
                expect(foundGroup.firstName).toBe('no')
                return done();
            });
    });
});

// describe('DELETE Group ', () => {
//     it('delete a VALID group ', async () => {
//         let foundGroup = await findOneByQuery('groups', { name: "nike"})
//         console.log(foundGroup._id.toString())
//         request(app)
//             .delete(`/api/groups/`+foundGroup._id.toString())
//             .expect(200)
//             .end(async (err :any, res : any) => {
//                 if (err) {
                    
//                     throw (err);
//                 }
                
//                 const foundGroup = await findOneByQuery('groups', { name: "nike"})
//                 expect(foundGroup).toBe(null)
                
//             });
        
//     });
// });
