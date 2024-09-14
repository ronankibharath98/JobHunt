import { singleUpload } from '../middleware/multer.js';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        // Check for missing required fields
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        // Check if user already exists with the same email
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        // Initialize variables for file upload
        const file = req.file;
        let cloudResponse = null;

        // Handle file upload if the file is provided
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse ? cloudResponse.secure_url : ""
            }
        });

        // Respond with success message
        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log("Error during registration:", error); // Log error for debugging
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User does not exist with this email",
                success: false
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }
        if (user.role !== role) {
            return res.status(403).json({
                message: "Unauthorized role",
                success: false
            });
        }
        const tokenData = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "7d" });
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
            bio: user.bio,
        }
        return res.status(200).cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            samesite: "strict"
        }).json({
            message: `Welcome ${user.fullname}`,
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logout successful",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const profilePic = req.files?.profilePic; // For profile picture upload
        const resume = req.files?.resume; // For resume upload

        // Handle profile picture upload
        let profilePicUrl;
        if (profilePic) {
            const profilePicUri = getDataUri(profilePic);
            const profilePicResponse = await cloudinary.uploader.upload(profilePicUri.content);
            profilePicUrl = profilePicResponse.secure_url;
        }

        // Handle resume upload
        let resumeUrl;
        if (resume) {
            const resumeUri = getDataUri(resume);
            const resumeResponse = await cloudinary.uploader.upload(resumeUri.content);
            resumeUrl = resumeResponse.secure_url;
        }

        const skillsArray = skills ? skills.split(",") : [];
        const userId = req.id; // Id is coming from the middleware
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User does not exist",
                success: false
            });
        }

        // Update user profile
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;
        if (profilePicUrl) user.profile.profilePic = profilePicUrl;
        if (resumeUrl) {
            user.profile.resume = resumeUrl;
            user.profile.resumeOriginalName = resume.originalname;
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        }
        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}
