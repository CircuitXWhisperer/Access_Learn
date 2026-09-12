import express from "express"
import { changePassword, forgotPassword, getCurrentUser, loginUser, logoutUser, registerUser, temporaryStudentLogin, updateCurrentUser, verification, verifyOTP } from "../controllers/userController.js"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { userSchema, validateUser } from "../validators/userValidate.js"

const router = express.Router()


router.post('/register',validateUser(userSchema), registerUser)
router.post('/verify', verification)
router.post('/login', loginUser)
router.post('/student-login', temporaryStudentLogin)
router.post('/logout',isAuthenticated, logoutUser)
router.get('/me', isAuthenticated, getCurrentUser)
router.patch('/me', isAuthenticated, updateCurrentUser)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp/:email', verifyOTP)
router.post('/change-password/:email', changePassword)

export default router