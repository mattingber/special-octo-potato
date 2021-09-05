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
    } catch (err) {}

    console.log(`Server started `);
});
afterAll(async () => {
    await server.close();
});

const group = { name: "nike", source: 'ES'}
describe('POST Group ', () => {
    it('create a VALID group ', (done) => {
        request(app)
            .post(`/api/groups`)
            .send(
                group
            )
            .expect(200)
            .end((err :any, res : any) => {
                if (err) {
                    console.log(err)
                    throw done(err);
                }
                console.log(res)
                expect(res.body.toString()).toBe(
                res.body.toString());
                return done();
            });
    });
});
