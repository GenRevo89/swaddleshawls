import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ClientSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            default: null,
            select: false,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        phone: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        address: {
            street: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            zip: { type: String, default: "" },
            country: { type: String, default: "" },
        },
        dateOfBirth: {
            type: String,
            default: "",
        },
        goals: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        collection: "clients",
    }
);

// Hash password before saving
ClientSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
ClientSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Strip password from JSON output
ClientSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
