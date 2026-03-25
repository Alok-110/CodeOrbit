import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },

    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },

    emailId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        lowercase: true,
        trim: true
    },

    age: {
        type: Number,
        min: 7,
        max: 80
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    password: {
        type: String,
        required: true
    },

    problemSolved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        unique: true
    }]
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
