import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import { verifyMail } from "../emailVerify/verifyMail.js";
import { Session } from "../models/sessionModel.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const TEMPORARY_UDID = "MH2720720060278925";
const TEMPORARY_STUDENT_EMAIL = "temporary.student@accesslearn.local";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password, role = "student" } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        })
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: "10m" })
        verifyMail(token, email)
        newUser.token = token
        await newUser.save()
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

export const verification = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing or invalid"
            })
        }

        const token = authHeader.split(" ")[1]

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY)
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "The registration token has expired"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Token verification failed"
            })
        }
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.token = null
        user.isVerified = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password, role = "student" } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }
        if (!["student", "administration"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be student or administration"
            })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access"
            })
        }
        const userRole = user.role || "student";
        if (userRole !== role) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to log in with this role"
            })
        }
        user.role = userRole;
        const passwordCheck = await bcrypt.compare(password, user.password)
        if (!passwordCheck) {
            return res.status(402).json({
                success: false,
                message: "Incorrect Password"
            })
        }

        //check if user is verified 
        if (user.isVerified !== true) {
            return res.status(403).json({
                success: false,
                message: "Verify your account than login"
            })
        }

        // check for existing session and delete it
        const existingSession = await Session.findOne({ userId: user._id });
        if (existingSession) {
            await Session.deleteOne({ userId: user._id })
        }

        //create a new session
        await Session.create({ userId: user._id })

        //Generate tokens
        const accessToken = jwt.sign({ id: user._id, role: userRole }, process.env.SECRET_KEY, { expiresIn: "10d" })
        const refreshToken = jwt.sign({ id: user._id, role: userRole }, process.env.SECRET_KEY, { expiresIn: "30d" })

        user.isLoggedIn = true;
        await user.save()

        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.username}`,
            accessToken,
            refreshToken,
            user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const temporaryStudentLogin = async (req, res) => {
    try {
        const { udid, name, className } = req.body;
        if (udid !== TEMPORARY_UDID) {
            return res.status(401).json({ success: false, message: "Invalid temporary UDID" });
        }

        if (mongoose.connection.readyState !== 1) {
            const accessToken = jwt.sign({ id: "temporary-student", role: "student", temporary: true, name: name || "Temporary Student", className: className || "Class 10" }, process.env.SECRET_KEY, { expiresIn: "10d" });
            return res.status(200).json({ success: true, message: "Temporary student access granted", accessToken, user: { id: "temporary-student", username: name || "Temporary Student", email: TEMPORARY_STUDENT_EMAIL, role: "student", className: className || "Class 10", isVerified: true } });
        }

        let user = await User.findOne({ email: TEMPORARY_STUDENT_EMAIL });
        if (!user) {
            user = await User.create({
                username: name || "Temporary Student",
                email: TEMPORARY_STUDENT_EMAIL,
                role: "student",
                className: className || "Class 10",
                isVerified: true,
                isLoggedIn: true
            });
        } else {
            user.username = name || user.username;
            user.role = "student";
            user.className = className || user.className || "Class 10";
            user.isVerified = true;
            user.isLoggedIn = true;
            await user.save();
        }

        const accessToken = jwt.sign({ id: user._id, role: "student" }, process.env.SECRET_KEY, { expiresIn: "10d" });
        return res.status(200).json({ success: true, message: "Temporary student access granted", accessToken, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getCurrentUser = async (req, res) => {
    return res.status(200).json({ success: true, data: req.user });
}

export const updateCurrentUser = async (req, res) => {
    try {
        const { name, className } = req.body;
        if (req.userId === "temporary-student") {
            return res.status(200).json({ success: true, data: { ...req.user, username: name, className } });
        }
        const user = await User.findByIdAndUpdate(req.userId, { username: name, className }, { new: true, runValidators: true });
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const logoutUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId === "temporary-student") {
            return res.status(200).json({ success: true, message: "Logged out successfully" });
        }
        await Session.deleteMany({ userId });
        await User.findByIdAndUpdate(userId, { isLoggedIn: false })
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000)

        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save()
        await sendOtpMail(email, otp);
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verifyOTP = async (req, res)=>{
    const {otp} = req.body
    const email = req.params.email

    if(!otp){
        return res.status(400).json({
            success:false,
            message:"OTP is requried"
        })
    }

    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        if(!user.otp || !user.otpExpiry){
            return res.status(400).json({
                success:false,
                message:"OTP not generated or already verified"
            })
        }
        if (user.otpExpiry < new Date()){
            return res.status(400).json({
                success:false,
                message:"OTP has expired. Please request a new one"
            })
        }
        if(otp !== user.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        user.otp = null
        user.otpExpiry = null
        await user.save()

        return res.status(200).json({
            success:true,
            message:"OTP verified successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const changePassword = async (req, res)=>{
    const {newPassword, confirmPassword} = req.body
    const email = req.params.email
    
    if(!newPassword || !confirmPassword){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }

    if(newPassword !== confirmPassword) {
        return res.status(400).json({
            success:false,
            message:"Password do not match"
        })
    }

    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({
            success:true,
            message:"Password changed successsfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}