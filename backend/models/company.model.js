import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    descripiton:{
        type: String
    },
    website:{
        type: String
    },
    location:{
        type: String
    },
    logo:{
        type: String,
        default: ""
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Company = mongoose.model("Company", companySchema);
export default Company;