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

app.use(session({secret: 'mihirtayshete'}));
const nanoid = require("nanoid");
const mongo = require("mongodb");
app.use(express.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var usercorrect = 0;
var loginFlag = 0;
var sess;
var fs = require("fs");
app.set("view engine", "ejs");

var multer = require("multer");
var upload = multer({ dest: "uploads/" });

app.post("/delete", urlencodedParser, async (req, res) => {
  let d_data = await Patient.deleteOne({ _id: req.body.id });
  console.log(req.body.id);
  setTimeout(function () {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }, 5000);
});

app.post("/approve", urlencodedParser, async (req, res) => {
  let u_data = await Patient.updateOne(
    { _id: req.body.id },
    {
      $set: {
        status: "Approved",
      },
    }
  );

  let data = await Patient.find();
  res.render("test", { data: data });
});

app.post("/decline", urlencodedParser, async (req, res) => {
  let u_data = await Patient.updateOne(
    { _id: req.body.id },
    {
      $set: {
        status: "Declined",
      },
    }
  );

  let data = await Patient.find();
  res.render("test", { data: data });
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
    });
    image.status = "Pending";
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
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] })
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

      // res.render('libraryuser.ejs')
      // res.render("login.ejs")
      // books.find({},(err,data)=>{
      //     if (err){
      //         console.log(err)
      //     }
      //     else{
      //         console.log(data)
      //         res.render("libraryuser.ejs",{datas:data})
      //     }
      // })
      let data = await Patient.find();
      res.render("test", { data: data });
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

      // res.render('libraryuser.ejs')
      // res.render("login.ejs")
      // books.find({},(err,data)=>{
      //     if (err){
      //         console.log(err)
      //     }
      //     else{
      //         console.log(data)
      //         res.render("libraryuser.ejs",{datas:data})
      //     }
      // })
      let data = await Patient.find({useremail:req.body.useremail,service:sess.service});
      res.render("appointment", { data: data });
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
