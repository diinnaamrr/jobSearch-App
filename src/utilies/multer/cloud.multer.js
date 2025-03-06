import multer from "multer";


export const fileValiadtion = {
  image: ["image/jpeg", "image/jpg", "image/png"],
  document: ["application/pdf"]
}
export const uploadCloudFile = (fileValiadtion = []) => {

  const storage = multer.diskStorage({})


  function fileFilter(req, file, cb) {
    if (fileValiadtion.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb("invalid file format", false)
    }

  }
  return multer({ dest: "tempPath", fileFilter, storage })

}