import mongoose, { Schema } from "mongoose";

const schema = new Schema({
    title: {
        type: String,
        required: true,
        validate: {
            validator: (v) => v !== v.toUpperCase(),
            message: props => `${props.value} is entirely uppercase!`
        }
    },
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const noteModel = mongoose.models.Note || mongoose.model("Note", schema);

export default noteModel;
