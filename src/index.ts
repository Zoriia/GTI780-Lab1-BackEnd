import express from 'express'
import requestId from 'express-request-id'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import { json } from 'body-parser'

require('child_process').fork('src/scripts/sensorScript.js')

import routes from './routes/index.js'

const app = express()

app.use(requestId())
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(json())

routes(app)

app.listen(Number.parseInt(process.env['BACKEND_PORT'] ?? '8080'))
