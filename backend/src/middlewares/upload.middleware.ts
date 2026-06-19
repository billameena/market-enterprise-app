import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { env } from '../configs/env';
import { AppError } from './error.middleware';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`, 400));
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 10,
  },
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount = 10) =>
  upload.array(fieldName, maxCount);
export const uploadFields = (
  fields: Array<{ name: string; maxCount?: number }>,
) => upload.fields(fields);
