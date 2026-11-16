const multer=require("multer");
const path=require("path");
const fs=require("fs");
if(!fs.existsSync("uploads")){
    fs.mkdirSync("uploads");}
const storage = multer.diskStorage({
    destination: (req,file, cb)=>cb(null,"uploads"),
    filename: (req, file, cb)=>{
        const uniqueName=Date.now()+path.extname(file.originalname);
cb(null,uniqueName);
    },});
function fileFilter(req,file,cb){
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
} else {
        cb(new Error("Only image files are allowed"));
}}
const upload=multer({
storage: storage,
fileFilter: fileFilter,
limits: { fileSize: 2 * 1024 * 1024 },
});
module.exports=upload;