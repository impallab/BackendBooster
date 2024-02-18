import { Router } from "express";
import {logOutUser, loginUser, registerUser, renewAccToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)    

//secured routes :
 router.route("/logout").post(verifyJWT , logOutUser)

 router.route( "/renew-token").post(renewAccToken)


export default router