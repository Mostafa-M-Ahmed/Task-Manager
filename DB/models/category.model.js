import mongoose from "mongoose";
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', required: true
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

const Category = model("Category", categorySchema);
export default Category;
