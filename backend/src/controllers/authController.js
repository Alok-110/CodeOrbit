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

    res.status(201).send("User created successfully");

   }catch(err){
        res.status(500).send("Error" + err);
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

        res.status(200).send("Login successful");

    }
    catch(err){

        res.status(500).send("Error " +err.message);
    }

}


export {register, login, logout}
