import { Router } from "express";
import {
    changePassword,
    getUserChannelInfo,
    getUserInfo,
    getWatchHistory,
    logOutUser,
    loginUser,
    registerUser,
    renewAccToken,
    updateAvtar,
    updateProfileInfo
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);

//secured routes :
router.route("/logout").post(verifyJWT, logOutUser);

router.route("/renew-token").post(renewAccToken);
router.route("/change-pass"), post(verifyJWT, changePassword);
router.route("/user-info").get(verifyJWT, getUserInfo);
router.route("/update-info").patch(verifyJWT, updateProfileInfo);
router.route("/change-avtar").patch(verifyJWT, upload.single("avtar"), updateAvtar);
router.route("/change-coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

//taking data from param:
router.route("/channel/:username").get(verifyJWT, getUserChannelInfo);
router.route("/history").get(verifyJWT, getWatchHistory);


export default router