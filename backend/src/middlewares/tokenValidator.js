import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { client } from "../configs/redis.js";


const tokenValidator = async (req, res, next) => {

    try{
    
        const {token} = req.cookies;
    
        if(!token)   
        return res.status(401).send("No token found");
    
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const{_id} = payload;

        if(!_id)
        return res.status(401).send("Invalid token payload");
        
        const user = await User.findById(_id);

        if(!user)
        return res.status(401).send("User does not exist");

        const blacklisted = await client.exists(`token:${token}`);

        if(blacklisted)
        return res.status(401).send("Invalid token");
        
        req.user = user;

        next();
   
    }
    catch(err){
        res.status(401).send("Error " +err.message);
    }
}

export default tokenValidator;
