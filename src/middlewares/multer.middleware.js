import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./src/public/temp")
    },
    filename: function (req, file, cb) {
      console.log(file)
      cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split('/')[1]}`)
    }
  })
  
  export const upload = multer({ storage: storage })