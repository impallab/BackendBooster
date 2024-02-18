import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

const uploadOnCloud= async (localFilePath)=>{
    try {
        if(!localFilePath) {
            throw new Error('Local file path is missing.');
        }
        //upload file:
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        //if file successfully uploaded:
      //  console.log("File has been uploaded successfuly on cloudinary ",responce.url);
      //  fs.unlinkSync(localFilePath);
       return responce;
    } catch (error) {
        // Handle specific errors
        if (error.message.includes('No such file or directory')) {
          console.error('Error: The specified file does not exist.');
        } else {
          console.error('Error uploading file to Cloudinary:', error.message);
        }
    
        // Remove the temporary file if upload fails
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
    
        // Return null in case of failure
        return null;
    }
}
export { uploadOnCloud };