const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImageController = async (req, res) => {
    try {
        // check if file is missing
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File is required. Please upload an image"
            })
        }
        const { url, publicId } = await uploadToCloudinary(req.file.path);

        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId
        })

        await newlyUploadedImage.save();

        // delete the file from local storage
        fs.unlinkSync(req.file.path)

        res.status(201).json({
            success: false,
            message: "Image uploaded",
            image: newlyUploadedImage
        })
    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again"
        })
    }
}

const fetchImagesController = async (req, res) => {
    try {
        // Sorting in mongodb
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);
        const sortObj = {}
        sortObj[sortBy] = sortOrder;
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);


        if (images) {
            res.status(200).json({
                success: true,
                currentPage: page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images
            })
        }
    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again"
        })
    }
}

const deleteImageController = async (req, res) => {
    try {
        const getCurrentImageID = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getCurrentImageID);

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Error! Image not found"
            })
        }

        // check if image was uploaded by current user
        if (image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Error! Image uploaded by a different user. Cannot delete"
            })
        }

        // delete image from cloudinary storage
        await cloudinary.uploader.destroy(image.publicId);

        // delete image from mongodb database
        await Image.findByIdAndDelete(getCurrentImageID);

        res.status(200).json({
            success: true,
            message: "Image deleted successfully "
        })
    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again"
        })
    }
}

module.exports = {
    uploadImageController,
    fetchImagesController,
    deleteImageController
}