import { randomUUID } from "crypto";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    id: { type: String, default: () => randomUUID()},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true},
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    Address: { },
    phoneNumber: { type: String, required: true },

});

export const User = mongoose.model("User", UserSchema);