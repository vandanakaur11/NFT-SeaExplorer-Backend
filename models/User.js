const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, "A user must have a first name!"],
        maxlength: [100, "The first name cannot exceed 100 characters.!"],
        minlength: [2, "The first name must have at least 2 characters.!"],
        trim: true,
      },
      last: {
        type: String,
        required: [true, "A user must have a last name!"],
        maxlength: [100, "The last name cannot exceed 100 characters.!"],
        minlength: [2, "The last name must have at least 2 characters.!"],
        trim: true,
      },
    },
    email: {
      type: String,
      required: [true, "A user must have a email address!"],
      maxlength: [100, "The email address cannot exceed 100 characters.!"],
      minlength: [5, "The email address must have at least 5 characters.!"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "A user must have a password!"],
      maxlength: [1024, "The password cannot exceed 1024 characters.!"],
    },
    location: {
      country: {
        type: String,
        default: "",
        maxlength: [100, "The country cannot exceed 100 characters.!"],
        trim: true,
      },
      state: {
        type: String,
        default: "",
        maxlength: [100, "The state cannot exceed 100 characters.!"],
        trim: true,
      },
      city: {
        type: String,
        default: "",
        maxlength: [100, "The city cannot exceed 100 characters.!"],
        trim: true,
      },
      streetAddress: {
        type: String,
        default: "",
        maxlength: [500, "The address cannot exceed 500 characters.!"],
        trim: true,
      },
      zipCode: {
        type: String,
        default: 00000,
        maxlength: [10, "The zipCode cannot exceed 10 characters.!"],
        trim: true,
      },
    },
    avatar: {
      type: String,
      default: "https://i.ibb.co/ts8kZYd/admin.png",
      trim: true,
    },
    hashToken: {
      type: String,
      required: [true, "A user must have a hask token!"],
      trim: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      required: [true, "A user must have a role!"],
      ref: "Role",
    },
    accountAccepted: {
      status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending",
      },
      reason: {
        type: String,
        default: "",
        trim: true,
      },
    },
    code: {
      type: Number,
      default: 000000,
      maxlength: [6, "The code cannot exceed 6 characters.!"],
      minlength: [6, "The code must have at least 6 characters.!"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
