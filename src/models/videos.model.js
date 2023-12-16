import mogoose ,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const videoSchema= new Schema({
    videoFile:{
        type:String,  //cloudinary url
        required:[true,"video is not available"]
    },
    thumbNail:{
        type:String,    //cloudinary
        required: true
    },
    title:{
        type:String,
        required:[title,"Title is missing"]
    },
    description:{
        type:String,
        required:true
    },
    duration:{      //cloudinary
        type: Number,
        required:true
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mogoose.model("Video",videoSchema)