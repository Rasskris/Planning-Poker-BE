import type { Request } from 'express';
import multer from 'multer';

const multerStorage = multer.diskStorage({
  destination: (_: Request, file, callback) => {
    callback(null, 'public/images');
  },
  filename: (req: Request, file, callback) => {
    const { fieldname, originalname } = file;
    const fileName = `${+Date.now()}-${originalname}`;

    req.body[fieldname] = fileName;

    callback(null, fileName);
  },
});

export const upload = multer({ storage: multerStorage });