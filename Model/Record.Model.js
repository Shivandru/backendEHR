const mongoose = require("mongoose");

const recordSchema = mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    blood_type: { type: String },
    condition: { type: String },
    patient_details: { type: String },
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const RecordModel = mongoose.model("blogs", recordSchema);

module.exports = { RecordModel };
