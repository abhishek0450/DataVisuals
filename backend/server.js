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

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials:true
}))

app.use('/user', userRoute)
app.use('/workspaces', workspaceRoute)
app.use('/datasets', datasetRoute)
app.use('/charts', chartRoute)

app.listen(PORT,()=>{
    connectDB()
    console.log(`Server is listening at port ${PORT}`);  
})