import express from "express"
import 'dotenv/config'
import connectDB from "./database/db.js"
import userRoute from "./routes/userRoute.js"
import workspaceRoute from "./routes/workspaceRoute.js"
import datasetRoute from "./routes/datasetRoutes.js"
import chartRoute from "./routes/chartRoutes.js"
import cors from 'cors'

const app = express()

const PORT = process.env.PORT || 8000
const allowedOrigins = new Set([
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost',
    'http://localhost:80',
    'http://127.0.0.1',
    'http://127.0.0.1:80'
].filter(Boolean))

app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
}))

app.use('/api/user', userRoute)
app.use('/api/workspaces', workspaceRoute)
app.use('/api/datasets', datasetRoute)
app.use('/api/charts', chartRoute)

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is listening at port ${PORT}`);
})