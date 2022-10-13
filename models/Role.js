const { Schema, model } = require("mongoose");

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A role must have a name!"],
      maxlength: [10, "The role cannot exceed 10 characters.!"],
      minlength: [3, "The role must have at least 3 characters.!"],
      enum: ["admin", "user"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Role", roleSchema);
