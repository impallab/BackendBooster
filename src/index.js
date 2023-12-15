// require('dotenv').config({path:'./env'});
import dotenv from "dotenv";

import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})


connectDB()
.then(()=>{
    application.listen(process.env.PORT ||8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch( (error)=>{
    console.log(`MONGODB connection failed `,error)
})



// first approach

/*
import express from "express";
const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR : ", error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Application is listening on ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR : ", error);
        throw error;
    }
})();
*/
