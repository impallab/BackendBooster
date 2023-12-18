import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema =new Schema(
    {
        userName:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avtar:{
            type:String,    //cloudinary url
            required:true
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        passWord:{
            type:String,
            required:[true,'Password is required']
        },
        refreshToken:{
            type:String,
            
        }
    },{timestamps:true})





    userSchema.pre("save", async function(next){
        if(this.isModified("passWord")){
            this.passWord=bcrypt.hash(this.passWord,10)
            next()
        }

    })

    userSchema.methods.isPassCorrect= async function (passWord){
      return await bcrypt.compare(passWord,this.passWord)
    }

    userSchema.methods.generateAccessToken= async function(){
        return await jwt.sign(
            {
                _id:this._id,
                email:this.email,
                userName:this.userName,
                fullName:this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }

    userSchema.methods.generateRefreshToken= async function(){
        jwt.sign(
            {
                _id:this._id
            },
            process.env.REFRESH_TOKEN_SECRET ,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }

    export const User = mongoose.model("User",userSchema)