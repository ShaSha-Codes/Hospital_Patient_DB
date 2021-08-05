const express=require('express');
const path=require('path');
const app=express();
const bodyParser=require('body-parser');
const patient_model = require("./patient_module");
const Patient = patient_model.Patient;
const adminmod = patient_model.Admin;

const nanoid=require("nanoid");
const mongo = require('mongodb');
app.use(express.json());
var urlencodedParser=bodyParser.urlencoded({extended:false});
var usercorrect=0;
var loginFlag=0;
app.set('view engine','ejs');


app.post("/delete",urlencodedParser, async (req, res) => {
	
	let d_data = await Patient.deleteOne({"_id": req.body.id});
	console.log(req.body.id);
	setTimeout(function(){
		res.sendFile(path.join(__dirname,"public","index.html"))
	 }, 5000);
});


app.post("/approve",urlencodedParser, async (req, res) => {
	
	
	let u_data = await Patient.updateOne({"_id": req.body.id}, {
		"$set": {
			"status" : "Approved",
		}
	});

	let data = await Patient.find();
	res.render('test',{data:data});
	
});



app.post("/decline",urlencodedParser, async (req, res) => {
		
	let u_data = await Patient.updateOne({"_id": req.body.id}, {
		"$set": {
			"status" : "Declined",
		}
	});

	let data = await Patient.find();
	res.render('test',{data:data});
	

});



app.get("/test.ejs",async (req, res)=>{
	let data = await Patient.find();
	res.render('test',{data:data});
});



app.post("/data",urlencodedParser, async (req, res) => {
	console.log(req.body.id);
	try {
		var o_id = new mongo.ObjectId(req.body.id);
		let data = await Patient.find({"_id":o_id});
		console.log(data[0].first_name);
		res.render('data',{data:data});
	}
	catch (err) {
		res.render('404');
	}
});

app.post("/patient",urlencodedParser, async (req, res) => {
	console.log(req.body)
	let p = await Patient(req.body);
	console.log(p);
	p.status="Pending"
	let result = p.save();
	res.render('patient',{id:p.id});
	
});
app.use(express.static(path.join(__dirname,"public"),{extensions:["html"]}));



app.get("/views/admin.ejs",async (req, res)=>{
	res.render('admin.ejs',{msg:""});
})

app.post("/admin.ejs",urlencodedParser, async (req,res)=>{
    console.log(req.body.useremail,req.body.pass)


    try{
        adminmod.find({},(err,data)=>{
            console.log(data,"h")
        })
       const email=await adminmod.findOne({useremail:req.body.useremail}).catch(()=>{
       });
       console.log(email.password,"hii")
       console.log("entered email",req.body.useremail,"entered")
       let checkpass= email.password==req.body.pass;
       console
       if (checkpass){
            console.log('u haved logged in')
            loginFlag=1

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
			res.render('test',{data:data});

       }
       else if (req.body.useremail==email.useremail){
        usercorrect=1
       }

        }
        catch(e){

            res.render('Admin',{msg:"User does not exist"})

        }

    if (usercorrect==1){
        usercorrect=0;
        res.render('admin',{msg:"password incorrect"})

    }

})

PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Running on port ${PORT}`));