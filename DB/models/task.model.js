import mongoose from "mongoose";
const { Schema, model } = mongoose;

const listItemSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

const taskSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    type: {
      type: String,
      enum: ['Text', 'List'],
      required: true
    },
    textBody: {
      type: String,
      validate: {
        validator: function(v) {
          return this.type === 'Text' ? v && v.length > 0 : true;
        },
        message: 'Text body is required for Text tasks'
      }
    },
    listItems: {
      type: [listItemSchema],
      validate: {
        validator: function(v) {
          return this.type === 'List' ? v && v.length > 0 : true;
        },
        message: 'List items are required for List tasks'
      }
    },
    isShared: {
      type: Boolean,
      default: false
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', required: true
    }
  },
  { timestamps: true, versionKey: "version_key" }
);

const Task = model("Task", taskSchema);
export default Task;
