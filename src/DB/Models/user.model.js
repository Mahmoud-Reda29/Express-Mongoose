import mongoose, { Schema, Model } from "mongoose"

const schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, min: 18, max: 60 }
}, { timestamps: true })


const userModel = mongoose.models.User || mongoose.model("User", schema);


export default userModel
