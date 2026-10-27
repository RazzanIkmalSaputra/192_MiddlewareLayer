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

//respon emvelope

function successResponse(res, message, data, status = 200) {
    return res.status(status).json({
        success: true,
        message,
        data,
        error: null,
    })
}

function errorResponse(res, message, status, details = null) {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        error: details,
    })
}

//join validation

const biodataSchema = joi.object({
    id: joi.number().integer().positive(),
    nama: joi.string().trim().min(2).max(100).required(),
    nim: joi.string(). trim(). min(5). max(20).required(),
    kelas: joi.string().trim().min(1).max(20).required(),
})

const idSchema = joi.object({
    id: joi.number().integer().positive().required(),
})
