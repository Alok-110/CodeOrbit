import { client } from "../configs/redis.js";
import Submission from "../models/submissionModel.js";
import User from "../models/userModel.js"
import validate from "../utils/validator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const register = async (req, res) => {

   try{
    validate(req.body);

    const {firstName, emailId, password} = req.body; 

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const user = await User.create(req.body);

    const token = jwt.sign(
        {_id: user._id, emailId: emailId, role : "user"}, 
        process.env.JWT_SECRET, 
        {expiresIn: "1h"})

    res.cookie("token", token, {maxAge : 60*60*1000});

    
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role
      }
    });

   }
   catch(err){
    res.status(400).json({
        message: err.message
    });
}
}

const login = async (req,res) => {

    try{

        const {emailId, password} = req.body;

        if(!emailId ||  !password)
         return res.status(400).send("Email and password required");
        
        const user = await User.findOne({emailId});

        //prompt user to register first and use return to exit code
        if (!user) 
        return res.status(404).send("No account found. Please sign up first.");
            
        const match = await bcrypt.compare(password, user.password);

        if(!match){
             return res.status(401).send("Invalid username or password");
        }

        const token = jwt.sign({_id: user._id, emailId: emailId, role:user.role}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.cookie("token", token, {maxAge : 60*60*1000});

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role
            }
        });

    }
    catch(err){

        res.status(500).send("Error " +err.message);
    }

}

const logout = async (req,res) => {

    try{

        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await client.set(`token:${token}`, "blacklisted");
        await client.expireAt(`token:${token}`, payload.exp);
        
        res.cookie("token", "", {expires : new Date(0)});
        res.status(200).send("Successfully logged out");
    }
    catch(err){
        res.status(500).send("Error " +err.message);
    }
}

const adminRegister = async (req, res) => {
    try {
        // validate data
        validate(req.body);

        const { password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "admin";

        const user = await User.create(req.body);

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("Admin registered successfully");

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Submission.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    res.json({ message: "Profile deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { register, login, logout, adminRegister, deleteProfile };

