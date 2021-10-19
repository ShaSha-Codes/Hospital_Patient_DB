const mongoose = require("mongoose");

const conn_str =
  "mongodb://root:root@cluster0-shard-00-00.exjjz.mongodb.net:27017,cluster0-shard-00-01.exjjz.mongodb.net:27017,cluster0-shard-00-02.exjjz.mongodb.net:27017/Hospital?ssl=true&replicaSet=atlas-2ymy0u-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
  .connect(conn_str, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected successfully..."))
  .catch((error) => console.log(error));

const patientSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  service: String,
  phone_number: Number,
  date: Date,
  message: String,
  email:String,
  img: {
    data: Buffer,
    contentType: String,
  },
  status: String,
});

const adminSchema = new mongoose.Schema({
  useremail: String,
  password: String,
});

const doctorSchema = new mongoose.Schema({
  useremail: String,
  password: String,
  service: String,
});

const adminObject = new mongoose.model("admin", adminSchema);
const patientObject = new mongoose.model("patients", patientSchema);
const doctorObject = new mongoose.model("doctor", doctorSchema);
exports.Patient = patientObject;
exports.Admin = adminObject;
exports.Doctor = doctorObject;
