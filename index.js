import express from 'express'
import pg from 'pg'

const app = express()
const port = 3000
const { Poll } =pg

const poll = new Poll({
  user: 'postgres',
 
})
