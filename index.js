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

/mid

function validateBody(schema) {
    return (req, res, next) => {
         const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            convert: true,
            allowUnknown: false,
        })

        if (error) {
            return errorResponse(
                res,
                'validasi input gagal',
                400,
                error.details.map(item => ({
                    field: item .path.join('.'),
                    message: item.message,
                }))
            )
        }

        req.body = value
        next()
    }
}

//MIDDLEWARE VALIDASI PARAMETER 

function validateParams(schema) {
    return (req, res, next) => {
         const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            convert: true,
            allowUnknown: false,
        })

        if (error) {
            return errorResponse(
                res,
                'validasi input gagal',
                400,
                error.details.map(item => ({
                    field: item .path.join('.'),
                    message: item.message,
                }))
            )
        }

        req.params = value
        next()
    }
}

// method get

app.get('/', async (req, res) => {
    const result = await pool.query()
    return successResponse(res, 'Data berhasil diambil', result.rows)
})

//method post

app.post(
    '/biodata',
    validateBody(biodataSchema),
    async (req, res) => {
        const { id, nama, nim, kelas } = req.body

        const result = await pool.query(
            `INSERT INTO biodata (id, nama, nim, kelas)
            VALUES ($1, $2, $3, $4) 
            RETURNING *`,
            [id ?? null,nama, nim, kelas]
        )
    }
)

//method put


app.put(
    '/biodata/:id',
    validateParams(idSchema),
    validateBody(biodataSchema.fork(
        ['nama', 'nim', 'kelas'],
        field => field.required()
    ).fork(['id'], field => field.forbidden())),
    async (req, res) => {
        const { id } = req.params
        const { nama, nim, kelas } = req.body

         const result = await pool.query(
            `UPDATE biodata
            SET nama = $1, nim = $2, kelas = $3
            WHERE id = $4
            RETURNING *`,
            [nama, nim, kelas, id]
        )

        if (result.rowCount === 0) {
            return errorResponse(
                res, 'Data tidak ditemukan', 404
            )
        }

        return successResponse(
            res,
            'Data berhasil diperbarui',
            result.rows[0],
        )
    }
)


//METHOD DELETE

app.delete(
    '/biodata/:id',
    validateParams(idSchema),
    async (req, res) => {
        const { id } = req.params

        const result = await pool.query(
            `DELETE FROM biodata WHERE id = $1 RETURNING *`,
            [id]
        )

        if (result.rowCount === 0) {
            return errorResponse(
                res, 'Data tidak ditemukan', 404
            )
        }

        return successResponse(
            res,
            'Data berhasil dihapus',
            result.rows[0],
        )
    }
)


//ROUTE TIDAK DITEMUKAN
app.use((req, res) => {
    return errorResponse(
        res,
        'endpoint tidak ditemukan',
        404
    )
})