const express=require('express');
const path=require('path');
const app=express();
const patient_model = require("./patient_module");
const Patient = patient_model.Patient;


app.use(express.static(path.join(__dirname,"public"),{extensions:["html"]}));
PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Running on port ${PORT}`));