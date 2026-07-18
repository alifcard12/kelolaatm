import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadedPhoto = { url: string; publicId: string };

/**
 * Upload satu buffer foto ke Cloudinary.
 * `folder` dipakai buat mengelompokkan foto di dashboard Cloudinary,
 * misal "kaset-logs/<kasetLogId>".
 */
export async function uploadPhoto(fileBuffer: Buffer, folder: string): Promise<UploadedPhoto> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload Cloudinary gagal."));
        resolve({ url: result.secure_url, publicId: result.public_id });
      })
      .end(fileBuffer);
  });
}

/**
 * Upload banyak foto sekaligus (paralel). Kalau salah satu gagal, semua akan reject
 * supaya tidak ada data foto yang "nyantol" tanpa tersimpan di DB.
 */
export async function uploadPhotos(files: File[], folder: string): Promise<UploadedPhoto[]> {
  return Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return uploadPhoto(buffer, folder);
    })
  );
}

/** Hapus satu foto dari Cloudinary berdasarkan public_id-nya. */
export async function deletePhoto(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
