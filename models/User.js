const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 3,
        max: 20,
        unique: true,
    },
    fullname: {
        type: String,
        require: true,
        min: 3,
        max: 30,
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        require: true,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    coverPicture: {
        type: String,
        default: "",
    },
    active: {
        type: Boolean,
        default: false,
    },
    code: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", UserSchema);