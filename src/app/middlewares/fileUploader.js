const multer = require("multer");
const fs = require("fs");

const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = "";

      if (
        file.fieldname === 'licenseFrontImage' ||
        file.fieldname === 'licenseBackImage'
      ) {
        uploadPath = 'uploads/images/licenses';
      } else if (file.fieldname === 'image') {
        uploadPath = 'uploads/images/image';
      } else if (file.fieldname === 'profile_image') {
        uploadPath = 'uploads/images/profile';
      } else if (file.fieldname === 'video') {
        uploadPath = 'uploads/video';
      } else if (file.fieldname === 'vehicleDocumentImage') {
        uploadPath = 'uploads/images/vehicle';
      } else if (file.fieldname === 'vehicleImage') {
        uploadPath = 'uploads/images/vehicle';
      } else {
        uploadPath = 'uploads';
      }

      

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "video/mp4"
      ) {
        cb(null, uploadPath);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedFieldnames = [
        'image',
        'vehicleImage',
        'vehicleDocumentImage',
        'profile_image',
        'licenseBackImage',
        'licenseFrontImage',
        'video_thumbnail',
      ];

    if (file.fieldname === undefined) {
      // Allow requests without any files
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "video/mp4"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'vehicleDocumentImage', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'licenseBackImage', maxCount: 1 },
    { name: 'licenseFrontImage', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
  ]);

  return upload;
};

module.exports = { uploadFile };
