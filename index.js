import express from 'express'
import pg from 'pg'

const app = express()
const port = 3000
const { Poll } =pg

const poll = new Poll({
  user: 'postgres',
  host: 'localhost',
  database: 'mahasiswa',
  password: 'Tnggl_25062006',
  port: 5432,
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//MIDDLEWARE
app.use((req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start

        console.log({
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
        })
    })
    
    next ()
})
