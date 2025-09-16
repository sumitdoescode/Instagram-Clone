import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (file) => {
    if (!file) return null;

    // Convert Blob → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, uploadResult) => {
                if (error) reject(error);
                else resolve(uploadResult);
            });
            stream.end(buffer);
        });

        return result;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        return null;
    }
};

// publicId is required to delete the file that's why we are storing it
const deleteFromCloudinary = async (publicId, resource_type = "image") => {
    try {
        if (!publicId) {
            console.log("publicId is required");
            return null;
        }
        const res = await cloudinary.uploader.destroy(publicId, {
            invalidate: true,
            resource_type: resource_type,
        });
        return res;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
