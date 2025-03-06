import mongoose, { Schema, Types, model } from "mongoose";
import { generateHash } from "../../utilies/security/hash.security.js";
import { generateDecryption, generateEncryption } from "../../utilies/security/encryption.security.js";
import { genderTypes, otpTypes, providerTypes, roleTypes } from "../../utilies/shared/enumTypes.js";



const userSchema = new Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: (data) => {
            return data?.provider === providerTypes.google ? false : true
        }
    },
    provider: {
        type: String,
        enum: (Object.values(providerTypes)),
        default: providerTypes.system
    },
    gender: {
        type: String,
        enum: (Object.values(genderTypes)),
        default: genderTypes.male
    },
    role: {
        type: String,
        enum: (Object.values(roleTypes)),
        default: roleTypes.user
    },
    isConfirmed: Boolean,
    mobileNumber: String,

    DOB: {
        type: Date,
        validate: {
            validator: function (value) {
                if (value > new Date()) {
                    return false
                }
                if (value > new Date().setFullYear(new Date().getFullYear() - 18)) {
                    return false
                }
                return true
            },
            message: "BOB must Be greater than now and your age must be greater than 18 years old"
        }
    },
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    changeCredentialTime: Date,

    profilePic: {
        secure_url: String,
        public_id: String
    },
    coverPic: {
        secur_url: String,
        public_id: String
    },
    Otp: [{
        code: String,
        type: { type: String, enum: (Object.values(otpTypes)) },
        expiresIn: Date

    }]


}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.pre("save", function (next, doc) {
    if (this.isModified('password')) {
        this.password = generateHash({ plainText: this.password })
    }


    if (this.isModified('mobileNumber')) {
        this.mobileNumber = generateEncryption({ plainText: this.mobileNumber })

    }

    next()
})





userSchema.post("findOne", function (doc, next) {
    if (doc && doc.mobileNumber) {
        doc.mobileNumber = generateDecryption({ cipherText: doc.mobileNumber })
    }
    next()
})



userSchema.virtual("userName").set(function (value) {
    this.firstName = value.split(" ")[0]
    this.lastName = value.split(" ")[1]
}).get(function () {
    return this.firstName + " " + this.lastName
})


export const userModel = mongoose.models.User || model("User", userSchema)
export const socketConnection = new Map() //[key =>value]