require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const app=express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false 
 }));
 
 app.use(passport.initialize());
 app.use(passport.session());

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
    image:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User" , userSchema);

const Pet =new mongoose.model("Pet", petSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

const pet1= new Pet({
    name:"Golden Retriever",
    rating: 8,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image:"Golden-retriever.jpg"
});
const pet2= new Pet({
    name:"Persian Cat",
    rating: 8,
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image:"Persian-Cat.jpg"
});
const pet3= new Pet({
    name:"Retired Army Dogs",
    rating: 8,
    image: "Retired-army-dog.jpg",
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
});
const pet4= new Pet({
    name:"Rescued Cat",
    rating: 8,
    image:"Rescued-cat.jpg",
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
});
const pet5= new Pet({
    name:"Rescued Dog",
    rating: 8,
    image:"Rescued-dog.jpg",
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
});
const pet6= new Pet({
    name:"Rabbit",
    rating: 8,
    image:"Rabbit.jpg",
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
    
    Pet.find({}).then((foundPet)=>{
        if(foundPet.length===0){
            Pet.insertMany(defaultPet);
        }
        res.render("adopt",{newPet: foundPet} );
    });


    
});
app.get("/report", (req,res)=>{
    res.render("report");
});

app.post("/login",(req,res)=>{
    const user=new User({
        username:req.body.username, 
        password:req.body.password
    });
    req.login(user,(err)=>{

        if(err)
        console.log(err);
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/");
            });
        }

    });
});
app.post("/register",(req,res)=>{
    User.register({username:req.body.username}, req.body.password , (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res , function(){
                res.redirect("/");
            });
        }
    }); 
});

app.listen(3000,function(){
    console.log("Server running at 3000.");
});