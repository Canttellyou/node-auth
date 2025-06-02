const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register controller
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // check if user already exists with same email or password
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with same username or email already exists"
            });
        }

        // hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || "user" // default role is user
        });

        await newUser.save();

        if (newUser) {
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Unable to register user. Please try again."
            });
        }

    } catch (error) {
        console.error("Error in registerUser:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error! Please try again"
        });
    }
}


// login controller

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        // check if user exists with same username
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // create user token
        const accessToken = jwt.sign({
            userId: existingUser._id,
            username: existingUser.username,
            role: existingUser.role
        }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
        });

    } catch (error) {
        console.error("Error in loginUser:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error! Please try again"
        });

    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.userInfo.userId;

        // extract old and new password
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Error! User not found"
            })
        }

        // check if old password is correct
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Error! Invalid credentials"
            });
        }
        // hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedNewPassword;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Password changed successfully"
        })


    } catch (e) {
        console.error("Error in loginUser:", e.message);
        return res.status(500).json({
            success: false,
            message: "Error! Please try again"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    changePassword
};