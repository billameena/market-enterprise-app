import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../configs/env';
import { FileUploadResult } from '../types/common.types';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  options: {
    publicId?: string;
    transformation?: Array<Record<string, unknown>>;
    width?: number;
    height?: number;
  } = {},
): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        public_id: options.publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: options.transformation ?? [
          { quality: 'auto', fetch_format: 'auto' },
        ],
        ...(options.width && { width: options.width }),
        ...(options.height && { height: options.height }),
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        const r = result as UploadApiResponse;
        resolve({
          url: r.secure_url,
          publicId: r.public_id,
          width: r.width,
          height: r.height,
          format: r.format,
          bytes: r.bytes,
        });
      },
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string } = {},
): string {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: options.quality ?? 'auto',
    ...(options.width && { width: options.width }),
    ...(options.height && { height: options.height }),
    crop: options.width || options.height ? 'fill' : undefined,
    secure: true,
  });
}
