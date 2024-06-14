import { test, beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'child_process'
import { title } from 'process'

describe('Transactions Routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })
    
    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
       /*const response =  await request(app.server).post('/transactions').send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit'
        })
    
        expect(response.statusCode).toEqual(201) */
    
        await request(app.server).post('/transactions').send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit'
        })
        .expect(201)
    
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server).post('/transactions').send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit'
        })

        const cookies = createTransactionResponse.get('Set-Cookie')!

        const listTransactionResponse = await request(app.server).get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        expect(listTransactionResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000,            })
        ])
    })

    it('should be able to list a especific transaction', async () => {
        const createTransactionResponse = await request(app.server).post('/transactions')
        .send({
            title: 'New Transaction',
            amount: 5000,
            type: 'credit'
        })

        const cookies = createTransactionResponse.get('Set-Cookie')!

        const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        const transactionId = listTransactionResponse.body.transactions[0].id
        console.log(transactionId)

        const getTransactionResponse = await request(app.server).get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000,
            })
        )
    })

    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(app.server).post('/transactions')
        .send({
            title: 'New Credit Transaction',
            amount: 5000,
            type: 'credit'
        })

        const cookies = createTransactionResponse.get('Set-Cookie')!

        await request(app.server).post('/transactions')
        .set('Cookie', cookies)
        .send({
            title: 'New Debit Transaction',
            amount: 2000,
            type: 'debit'
        })


        const summaryResponse = await request(app.server).get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

        expect(summaryResponse.body.summary).toEqual({
            amount: 3000,
        })
    })

})