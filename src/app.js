import  express  from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
const app= express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"12kb"}))
app.use(express.urlencoded({extended:true,limit:"12kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// import routes:
import userRouter from './routes/user.routes.js'

//declaration of routes :
app.use("/api/v1/users",userRouter)
 
// url will be look like : => http://localhost:3000/api/v1/users/register

export { app}