import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Contoh helper untuk upload dari server action nanti (misal saat fitur Kaset/Ticket dibuat):
//
// export async function uploadPhoto(fileBuffer: Buffer, folder: string) {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ folder }, (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       })
//       .end(fileBuffer);
//   });
// }

export default cloudinary;
