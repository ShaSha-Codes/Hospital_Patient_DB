const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const bodyParser = require("body-parser");
const patient_model = require("./patient_module");
const session = require('express-session');
const Patient = patient_model.Patient;
const adminmod = patient_model.Admin;
const doctormod = patient_model.Doctor;
const nodemailer=require("nodemailer");
app.use(session({secret: 'mihirtayshete'}));
const nanoid = require("nanoid");
const mongo = require("mongodb");
app.use(express.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var usercorrect = 0;
var loginFlag = 0;
var sess;
var fs = require("fs");
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] })
);



app.set("view engine", "ejs");

var multer = require("multer");
var upload = multer({ dest: "uploads/" });




const transporter=nodemailer.createTransport({
  service: "hotmail",
  auth:{
    user:"nodehospital@outlook.com",
    pass:"meowmeow1"
  }
});



app.post("/delete", urlencodedParser, async (req, res) => {
  let d_data = await Patient.deleteOne({ _id: req.body.id });
  console.log(req.body.id);
  setTimeout(function () {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }, 5000);
});




app.post("/approve", urlencodedParser, async (req, res) => {
  let u_data
  if(sess==undefined ){
    console.log("No")
  }
  else if(sess.admin==1){
    
   u_data = await Patient.updateOne(
    { _id: req.body.id },
    {
      $set: {
        status: "Approved",
      },
    }
  );
  }
  res.redirect('/admin/table/2')
});




app.post('/schedule',urlencodedParser,async(req,res)=>{
  console.log(req.body.date)
  let data = await Patient.find({service:sess.service,date:req.body.date,status:"Approved"});
  res.render("appointment", { data: data,date:req.body.date});
})





app.get("/admin/table/:id",urlencodedParser, async (req, res) => {
  if(sess==undefined){
    res.redirect('/views/admin.ejs')
  }else if(sess.admin==0){
    res.redirect('/views/admin.ejs')
  }else if(sess.admin==1){
    let dataA,dataP,dataD;
    if(req.params.id==0){
      dataP = await Patient.find({status:"Pending"});
      dataA = await Patient.find({status:"Approved"});
      dataD = await Patient.find({status:"Declined"});
    }else if(req.params.id==1){
      dataP = await Patient.find({status:"Pending"});
      dataA=""
      dataD=""
    }else if(req.params.id==2){
      dataP =""
      dataA = await Patient.find({status:"Approved"});
      dataD=""
    }else if(req.params.id==3){
      dataP = ""
      dataA=""
      dataD = await Patient.find({status:"Declined"});
    }
    res.render("test", { dataP,dataA,dataD });
  }

});





app.get("/logout",urlencodedParser, async (req, res) => {
  sess = req.session;
  sess.admin=0;
  res.redirect('/views/admin.ejs')
})





app.post("/decline", urlencodedParser, async (req, res) => {
  let u_data = await Patient.updateOne(
    { _id: req.body.id },
    {
      $set: {
        status: "Declined",
      },
    }
  );

  res.redirect('/admin/table/3')
});




app.get("/test.ejs", async (req, res) => {
  let data = await Patient.find();
  res.render("test", { data: data });
});



app.get("/api", async (req, res) => {
  let data = await Patient.find();
  res.render("api", { data: data });
});




app.post("/data", urlencodedParser, async (req, res) => {
  console.log(req.body.id);
  try {
    var o_id = new mongo.ObjectId(req.body.id);
    let data = await Patient.find({ _id: o_id });
    console.log(data[0].first_name);
    res.render("data", { data: data });
  } catch (err) {
    res.render("404");
  }
});




app.post(
  "/patient",
  urlencodedParser,
  upload.single("image"),
  async (req, res) => {
    var image = new Patient({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      service: req.body.service,
      phone_number: req.body.phone_number,
      date: req.body.date,
      message: req.body.message,
      email:req.body.email
    });
    image.status = "Pending";
    const options={
      from:"nodehospital@outlook.com",
      to:req.body.email,
      subject:"Your Appointment ID!",
      text:"Here is your Appointment ID:"+image.id
    };
    transporter.sendMail(options,(err)=>{
      if(err){
        console.log(err);
      }
      console.log(info.response);
    })
    try {
      image.img.data = fs.readFileSync(req.file.path);
      image.img.contentType = "image/png";
    } catch (err) {}
    
    image.save(function (err) {
      if (err) {
        return next(err);
      }
     
      res.render("patient", { id: image.id });
    });
  }
);





app.get("/views/admin.ejs", async (req, res) => {
  res.render("admin.ejs", { msg: "" });
});




app.post("/admin.ejs", urlencodedParser, async (req, res) => {
  console.log(req.body.useremail, req.body.pass);

  try {
    adminmod.find({}, (err, data) => {
      console.log(data, "h");
    });
    const email = await adminmod
      .findOne({ useremail: req.body.useremail })
      .catch(() => {});
    console.log(email.password);
    console.log("entered email", req.body.useremail, "entered");
    let checkpass = bcrypt.compareSync(req.body.pass, email.password);
    console.log(checkpass);
    if (checkpass) {
      console.log("u haved logged in");
      loginFlag = 1;
      sess=req.session;
      sess.admin=1;

      res.redirect('/admin/table/0')
    } else if (req.body.useremail == email.useremail) {
      usercorrect = 1;
    }
  } catch (e) {
    res.render("Admin", { msg: "User does not exist" });
  }

  if (usercorrect == 1) {
    usercorrect = 0;
    res.render("admin", { msg: "password incorrect" });
  }
});

app.get("/views/doctor", async (req, res) => {
  res.render("doctor.ejs", { msg: "" });
});




app.post("/doctor", urlencodedParser, async (req, res) => {
  console.log(req.body.useremail, req.body.pass);
  sess = req.session;
  try {
    doctormod.find({}, (err, data) => {
      console.log(data, "h");
    });
    const email = await doctormod
      .findOne({ useremail: req.body.useremail})
      .catch(() => {});
    console.log(email.password);
    console.log("entered email", req.body.useremail, "entered");
    let checkpass = bcrypt.compareSync(req.body.pass, email.password);
    console.log(checkpass);
    if (checkpass) {
      console.log("u haved logged in");
      loginFlag = 1;
      sess.service=email.service;
      let today = new Date().toISOString().slice(0, 10)
      let data = await Patient.find({useremail:req.body.useremail,service:sess.service,date:today,status:"Approved"});
      
      res.render("appointment", { data: data,date:today });
    } else if (req.body.useremail == email.useremail) {
      usercorrect = 1;
    }
  } catch (e) {
    res.render("doctor", { msg: "User does not exist" });
  }

  if (usercorrect == 1) {
    usercorrect = 0;
    res.render("doctor", { msg: "password incorrect" });
  }
});



PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
