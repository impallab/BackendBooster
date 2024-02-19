import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js" 
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const genAccAndRefTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }


  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
  }
}

//controller to register a user :

const registerUser = asyncHandler(async (req, res) => {
  // Destructure request body
  const { fullName, email, username, password } = req.body;

  // Validation check
  if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are mandatory, fill each field wisely.");
  }

  // Check if user already exists
  const userExist = await User.findOne({
    // $or: [{ 'username': username }, { 'email': email }]  //find based on username or email.
    'email': email  // find based on email only.
  });

  if (userExist) {
    throw new ApiError(409, "User with the same name or email already exists.");
  }

  //Checks for avtar and coverImage uploaded successfully or not
  const avtarLocalPath = req.files?.avtar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  // Strict Check avtar image :
  if (!avtarLocalPath) {
    throw new ApiError(400, "Please upload Avtar successfully.")
  }
  // Perform cloudinary upload and database entry operations:
  //   const avtar = await uploadOnCloud(avtarLocalPath);
  //   const coverImage = await uploadOnCloud(coverLocalPath);

  //check again specially avtar image uploaded on cloud or not:
  //   if(!avtar){
  //    throw new ApiError(400,"Avtar image is required.")
  //   }

  // Create User object in database :
  const user = await User.create(
    {
      fullName,
      username: username.toLowerCase(),
      email,
      avtar: avtarLocalPath,
      coverImage: coverLocalPath || "",
      password
    }
  )

  // Remove sensitive information from the response :
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  //Check wheater user object is successfully created or not :
  if (!createdUser) {
    throw new ApiError(500, "Sorry something gone worng while registering , please try again !!")
  }

  //Return success response if userObject is created successfully.
  return res.status(201).json(
    new ApiResponse(200, createdUser, "Congrats!! , User has been registered successfully.")
  )


});

//controller to authentically login a user :

const loginUser = asyncHandler(async (req, res) => {
  // take data from request.body :
  // login via  username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPassValid = await user.isPassCorrect(password)

  if (!isPassValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await genAccAndRefTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    )

})

// controller to give the access to logout a user :

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

// controller to renew user's access token with the saved Token :
const renewAccToken = asyncHandler(async (req, res) => {
  const userRefToken = rea.cookies.refreshToken || req.body.refreshToken;
  if (!userRefToken) {
    throw new ApiError(401, "Unauthorized Request , please login again !")
  }

  try {
    const decodedToken = jwt.verify(userRefToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if ((!user || user.refreshToken) !== userRefToken) {
      throw new ApiError(401, "Invalid token or expired, please login again !")
    }

    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, renewedRefreshToken } = await genAccAndRefTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", renewedRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: renewedRefreshToken
          },
          "Access-Token has been  Renewed"
        )
      )

  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to authenticate the request");
  }


})

//controller to give access to change user's password :

const changePassword = asyncHandler(async (req, res) => {
  const { oldPass, newPass, confirmPass } = req.body;
  if (!(newPass === confirmPass)) {
    throw new ApiError(400, "New Password and Confirmation Password are not same!");
  }
  const user = await User.findById(req.user?._id);
  const isPassCorrect = await user.isPassCorrect(oldPass);
  if (!isPassCorrect) {
    throw new ApiError(403, "The old Password is incorrect ");
  }
  user.password = newPass;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(201, {}, "Password has been changed successfully."));

})

//To get the current user  profile information:

const getUserInfo = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current User's details fetched successfully.")
})

// To update the user's fullname and email :

const updateProfileInfo = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    new ApiError(400, "Please provide both Full Name & Email.");
  }

  const user = User.findByIdAndUpdate(
    req.uesr._id,
    {
      $set: {
        fullName,
        email
      }
    },
    { new: true } // it will the return the updated value.
  ).select("-password"); // For not to send back the password of the user in the response.
  // console.log('Updated User',user);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile Updated Succesfully."));

});

//To update Avtar File :

const updateAvtar = asyncHandler(async(req,res)=>{
  avtarLocalPath = req.file?.path;
  if(!avtarLocalPath){
    throw new ApiError(400,"Please upload a valid avtar-image file !!");
  }

  const avtar =avtarLocalPath; // for saving image's local path in database.
  // const avtar = await uploadOnCloud(avtarLocalPath); //for save the image file in the cloud.
  // if(!avtar.url){
  //   throw new ApiError(400,"Error occured while uploding on cloud!!, Please try again. ");
  // }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avtar:avtar.url
      }
    },
    {new : true}
  ).select("-password");
  return res
  .status(200)
  .json(new ApiResponse(200,user,"User Avtar Image has been updated successfully!"));
})

//To update Cover-image File :

const updateCoverImage = asyncHandler(async(req,res)=>{
  coverLocalPath = req.file?.path;
  if(!coverLocalPath){
    throw new ApiError(400,"Please upload a valid cover-image file !!");
  }

  const coverImage =coverLocalPath; // for saving image's local path in database.
  // const coverImage = await uploadOnCloud(coverLocalPath); //for save the image file in the cloud.
  // if(!coverImage.url){
  //   throw new ApiError(400,"Error occured while cover-imager uploding on cloud!!");
  // }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new : true}
  ).select("-password");
  return res
  .status(200)
  .json(new ApiResponse(200,user,"Cover-image has been updated successfully!"));
})

export {
  logOutUser,
  loginUser,
  registerUser,
  renewAccToken,
  changePassword,
  getUserInfo,
  updateProfileInfo,
  updateAvtar,
  updateCoverImage
}

