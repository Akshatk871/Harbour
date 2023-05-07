require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const fetchuser = require('./fetchuser');


const app=express();
const secret=process.env.SECRET;


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());


mongoose.connect(process.env.MONGO, {useNewUrlParser:true});

const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String
});

const petSchema=new mongoose.Schema({
    name:String,
    rating: Number,
    about:String,
    image:String,
    adopt: Boolean
});



const User = new mongoose.model("User" , userSchema);

const Pet =new mongoose.model("Pet", petSchema);

const pet1= new Pet({
    name:"Golden Retriever",
    rating: 8,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image:"Golden-retriever.jpg",
    adopt: false
});
const pet2= new Pet({
    name:"Persian Cat",
    rating: 8,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image:"Persian-Cat.jpg",
    adopt: false
});
const pet3= new Pet({
    name:"Retired Army Dogs",
    rating: 8,
    image: "Retired-army-dog.jpg",
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    adopt: false
});
const pet4= new Pet({
    name:"Rescued Cat",
    rating: 8,
    image:"Rescued-cat.jpg",
    adopt: false,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
});
const pet5= new Pet({
    name:"Rescued Dog",
    rating: 8,
    image:"Rescued-dog.jpg",
    adopt: false,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
});
const pet6= new Pet({
    name:"Rabbit",
    rating: 8,
    image:"Rabbit.jpg",
    adopt: false,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
});

const defaultPet=[pet1, pet2, pet3, pet4, pet5, pet6];

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", (req,res)=>{
    res.render("login");
});
app.get("/register", (req,res)=>{
    res.render("register");
})

    
app.get("/adopt", (req,res)=>{
   return res.render("adopt");
});

app.post("/adopt", async (req,res)=>{
    const pet = await Pet.findByIdAndUpdate(req.body.id, {adopt:true});
    res.json({message:"Congrats! You have adopted "+pet.name});
});

app.get("/logout", (req,res)=>{
    req.logout(req.user, err => {
        if(err) return next(err);
        res.redirect("/");
      });
});
app.get("/report", (req,res)=>{
    res.render("report");
});

app.get("/about", (req,res)=>{
    res.render("about");
});

app.post("/login", async (req,res)=>{
   const {email, password}=req.body;

    if(!isEmail(email)){
        return res.json({message:"Invalid email"});
    }

    try{
        let user = await User.findOne({email:email});
        if(!user){
            return res.json({message:"User does not exist"});
        }
        const match = await bcrypt.compare(password.toString(), user.password);
        if(!match){
            return res.json({message:"Invalid credentials"});
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(payload, secret);
        return res.json({success: true,token: token, message:"User logged in successfully"});

    }catch(err){
        console.log(err);
        return res.json({message:"Something went wrong"});
    }
});

app.post("/register", async (req,res)=>{
   const {name, email, password}=req.body;

   if(!isEmail(email)){
         return res.json({message:"Invalid email"});
    }

    try{
        let user = await User.findOne({email});
        if(user){
            return res.json({message:"User already exists"});
        }
        const securedPassword = await bcrypt.hash(password.toString(), 10);
        user = await User.create({
            name,
            email,
            password:securedPassword
        });
        return res.json({message:"User created successfully"});
    }catch(err){
        console.log(err);
        return res.json({message:"Something went wrong"});
    }
});

const isEmail = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

app.listen(3000,function(){
    console.log("Server running at 3000.");
});