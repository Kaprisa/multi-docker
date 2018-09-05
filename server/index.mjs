import keys from './keys'

// Express app setup
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Postgres client setup

import pg from 'pg'
const pgClient = new pg.Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  database: keys.pgDatabase,
  host: keys.pgHost,
  port: keys.pgPort
})

pgClient.on('error', () => console.error('Lost PG connection'))

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.error(err))

// Redis client setup
import redis from 'redis'

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate()

// Express routes handlers

app.get('/', (req, res) => {
  res.send('Hi')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values')
  res.send(values)
})

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const index = +req.body.index
  if (index > 40) {
    return res.status(422).send('Index too high')
  }
  redisClient.hset('values', index, 'Nothing yet')
  redisPublisher.publish('insert', index)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
  res.send({working: true})
})

app.listen(5000, () => {
  console.log('App is listening on port 5000')
})
