import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
// import { uploadOnCloud } from "../utils/cloudinary.js" 
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  // Destructure request body
  const { fullName, email, userName, password } = req.body;

  // Validation check
  if ([fullName, userName, email, password].some((field) => field?.trim()==="")) {
    throw new ApiError(400, "All fields are mandatory, fill each field wisely.");
  }

  // Check if user already exists
  const userExist = await User.findOne({
    $or: [{ 'username': userName }, { 'email': email }]
  });

  if (userExist) {
    throw new ApiError(409, "User with the same name or email already exists.");
  }

  //Checks for avtar and coverImage uploaded successfully or not
  const avtarLocalPath = req.files?.avtar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

 // Strict Check avtar image :
  if(!avtarLocalPath){
   throw new ApiError(400,"Please upload Avtar successfully.")
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
      userName: userName.toLowerCase(),
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
  if (!createdUser){
   throw new ApiError(500, "Sorry something gone worng while registering , please try again !!")
  }

  //Return success response if userObject is created successfully.
  return res.status(201).json(
   new ApiResponse(200, createdUser , "Congrats!! , User has been registered successfully.")
  )


});

export { registerUser };