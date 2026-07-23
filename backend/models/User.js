
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,  // name compulsory
        trim: true, //removes extra spaces
    },

    email: {
        type: String,
        required: true,
        unique: true, //only unique email is allowed
        lowercase: true, //email in lowercase
        trim: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6, //password must be at least 6 characters long
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;