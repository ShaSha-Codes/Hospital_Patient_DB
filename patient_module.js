const mongoose = require("mongoose");

const conn_str = "mongodb://admin:admin@cluster0-shard-00-00.06prr.mongodb.net:27017,cluster0-shard-00-01.06prr.mongodb.net:27017,cluster0-shard-00-02.06prr.mongodb.net:27017/tcet?ssl=true&replicaSet=atlas-j94tl3-shard-0&authSource=admin&retryWrites=true&w=majority";


mongoose.connect(conn_str, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Connected successfully..."))
	.catch( (error) => console.log(error) );
	
	
const userSchema = new mongoose.Schema({
	first_name: String,
	last_name: String,
	service: String,
    phone_number: Number,
    date:Date,
    message: String
})

//Step 3: Create collection Object (model)
// MAPPING 
const userObject = new mongoose.model("users", userSchema);

exports.User = userObject;