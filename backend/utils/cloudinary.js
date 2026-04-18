const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 image string to Cloudinary
 * @param {string} base64Data - The base64 string of the image
 * @param {string} folder - The folder to store the image in
 * @returns {Promise<string>} - The absolute URL of the uploaded image
 */
const uploadToCloudinary = async (base64Data, folder = "attendance/photos") => {
  try {
    const response = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      resource_type: "auto",
    });
    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

/**
 * Deletes an image from Cloudinary using its absolute URL
 * @param {string} url - The absolute URL of the Cloudinary image
 */
const deleteFromCloudinary = async (url) => {
  if (!url || !url.includes("cloudinary.com")) return;

  try {
    // Extract public_id from URL: /upload/(?:v\d+/)?(.+)\.[a-z]+$
    // Example: https://res.cloudinary.com/cloud/image/upload/v123/folder/name.jpg -> folder/name
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      const publicId = match[1];
      console.log("Deleting Cloudinary image:", publicId);
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    // We don't throw here to avoid blocking user deletion if photo deletion fails
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };

