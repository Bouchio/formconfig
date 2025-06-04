// backend/models/formConfig.model.js
import mongoose from "mongoose";

const formConfigSchema = new mongoose.Schema({
  formName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  config: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const FormConfig = mongoose.model("FormConfig", formConfigSchema);

export default FormConfig;
