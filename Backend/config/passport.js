import passport from "passport";
import  {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { User } from "../models/userModel.js";

const googleCredentialsConfigured = process.env.GOOGLE_CLIENT_ID
  && process.env.GOOGLE_CLIENT_SECRET
  && process.env.GOOGLE_CLIENT_ID !== "your_google_client_id"
  && process.env.GOOGLE_CLIENT_SECRET !== "your_google_client_secret";

if (googleCredentialsConfigured) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async(accessToken, refreshToken, profile, cb)=> {
    console.log(profile);
    
    try {
      let user = await User.findOneAndUpdate({ googleId: profile.id }, {isLoggedIn:true});
          
      if(!user){
        user = await User.create({
            googleId: profile.id,
            username:profile.displayName,
            email:profile.emails[0].value,
            avatar:profile.photos[0].value,  
            role:"student",
            isLoggedIn:true,
            isVerified:true        
        })
      }

      if (!user.role) {
        user.role = "student";
        await user.save();
      }

      return cb(null, user);

    } catch (error) {
        return cb(error, null)
    }
    
    }
  ));
}