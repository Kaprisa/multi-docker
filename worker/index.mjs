import redis from 'redis'
import keys from './keys'

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort
})

const sub = redisClient.duplicate()

function fib(index) {
  if (index < 2) {
    return 1
  }
  return fib(index - 1) + fib(index - 2)
}

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(+message))
})

sub.subscribe('insert')
