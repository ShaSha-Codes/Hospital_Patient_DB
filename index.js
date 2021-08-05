const express=require('express');
const path=require('path');
const app=express();
const bodyParser=require('body-parser');
const patient_model = require("./patient_module");
const Patient = patient_model.Patient;
const nanoid=require("nanoid");
const mongo = require('mongodb');
app.use(express.json());
var urlencodedParser=bodyParser.urlencoded({extended:false});

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
		res.send("<h1>Error</h1>")
	}
});

app.post("/patient",urlencodedParser, async (req, res) => {
	console.log(req.body)
	let p = await Patient(req.body);
	console.log(p);
	let result = p.save();
	res.render('patient',{id:p.id});
	
});
app.use(express.static(path.join(__dirname,"public"),{extensions:["html"]}));

PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Running on port ${PORT}`));