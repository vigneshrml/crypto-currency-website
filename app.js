var express         = require('express'),
    app             = express(),
    mongoose        = require('mongoose'),
    bodyParser      = require('body-parser'),
    passport        = require('passport'),
    methodOverride  = require('method-override'),
    flash           = require("connect-flash"),
    LocalStrategy   = require("passport-local");

var User  = require("./models/user");
var Pool  = require("./models/pool");
var port = process.env.PORT || 9900;

    app.use(flash());   
    app.set("view engine","ejs");
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static("assets"));
    app.use(methodOverride("_method"));


     mongoose.connect("mongodb+srv://cryptrich21:cryptrich21@cryptrich.q9h6r.mongodb.net/cryptrich?retryWrites=true&w=majority",{
        useNewUrlParser :true,
        useCreateIndex  :true,
        useUnifiedTopology: true
      }).then(() =>{
        console.log("mongodb connected");
       }).catch(err =>{
         console.log("ERROR", err.message);
       });
       mongoose.set('useFindAndModify', false);
  
      app.use(require("express-session")({
       secret : 'without auth',
       resave : false,
       saveUninitialized : false
      }));
      
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use(function(req, res,next){
        res.locals.currentUser = req.user;
        next();
      });

      app.use(function(req, res, next){
        res.locals.message = req.flash();
        next();
    }); 


    app.get("/",function(req,res){
      Pool.find({},function(err,poll){
        if(err){
          console.log(err);
        }else{
          res.render("index",{poll:poll});
        }
      });
    });
    app.get("/bitcoin",isLoggedIn,function(req,res){
      Pool.find({},function(err,poll){
        if(err){
          console.log(err);
        }else{
          res.render("bitcoin", {poll:poll});
        }
      });
   });
   app.get("/ethereum",isLoggedIn,function(req,res){
    Pool.find({},function(err,poll){
      if(err){
        console.log(err);
      }else{
        res.render("ethereum", {poll:poll});
      }
    });
 });
 app.get("/litecoin",isLoggedIn,function(req,res){
  Pool.find({},function(err,poll){
    if(err){
      console.log(err);
    }else{
      res.render("litecoin", {poll:poll});
    }
  });
});
app.get("/tron",isLoggedIn,function(req,res){
  Pool.find({},function(err,poll){
    if(err){
      console.log(err);
    }else{
      res.render("tron", {poll:poll});
    }
  });
}); 
      app.get("/login",function(req,res){
        res.render("login");
      });
      app.get("/rule",function(req,res){
        res.render("rule");
      });
      app.get("/bounty",function(req,res){
        res.render("bunty");
      });
      app.get("/notfound",function(req,res){
        res.render("notfound");
      });
      app.get("/referral/:id",function(req,res){
        User.findById(req.params.id,function(err,user){
          if(err){
            res.redirect('/notfound');
          }else{
            res.render("register" , {user:user});
          }
        });
      });

      app.get("/profile",isLoggedIn,function(req,res){
        User.find({sponsor : req.user._id},function(err,sponsor){
          if(err){
            console.log(err);
          }else{
            res.render("profile", {sponsor:sponsor});
          }
        });
        
  });
  app.put("/profile/:id",function(req,res){
    var newobj = {
      bitcoin : req.body.bitcoin,
      ethereum: req.body.ethereum,
      litecoin: req.body.litecoin,
      tron    : req.body.tron
    };
    User.findByIdAndUpdate(req.user._id,newobj,function(err,sponsor){
      if(err){
        console.log(err);
      }else{
        res.redirect("/profile");
      }
    });
    
});


 

//!Admin-side rendering
  app.get("/admin-panel",isLoggedIn,authRole(true),function(req,res){
    Pool.find({},function(err,poll){
      if(err){
        console.log(err);
      }else{
         res.render("admin-panel", {poll:poll});
      }
    });
  });
  
  app.get("/admin-user",isLoggedIn,authRole(true),function(req,res){
    User.find({}).sort({"_id" : -1}).exec(function(err,user){
      if(err){
        console.log(err);
      }else{
        res.render("admin-user",{user:user});
      }
    });
  });

  app.get("/editpoll/:id",isLoggedIn,authRole(true),function(req,res){
    Pool.findById(req.params.id,function(err,poll){
      if(err){
        console.log(err);
      }else{
         res.render("edit",{poll:poll});
      }
    });
  });

  app.post("/newpoll",function(req,res){
    var obj = {
      pool : req.body.pool,
      plan : req.body.plan,
      percent : req.body.percent
    };
    Pool.create(obj,function(err,newpool){
      if(err){
        console.log(err);
      }else{
        res.redirect("/admin-panel");
      }
    });
  });

  app.put("/editpoll/:id",function(req,res){
    var newobj = {
      percent : req.body.percent
    };
    Pool.findByIdAndUpdate(req.params.id, newobj ,function(err,poll){
      if(err){
        console.log(err);
      }else{
        res.redirect("/admin-panel");
      }
    });
  });

 

            //! Registration Side
            app.post("/register",function(req,res){
              var newobj = {
                  sponsor     : req.body.sponsor,
                  username    : req.body.username
                };
              User.register(newobj , req.body.password,function(err,newuser){
                      if(err){
                        req.flash("error", err.message);
                        res.redirect("/");
                      }
                        passport.authenticate("local")(req,res,function(){
                        res.redirect("/profile");
                      });
                }); 
          });

            //!  Login Side

          app.post("/login",passport.authenticate("local",
              {
                    successRedirect: "/profile",
                    failureRedirect: "/login",
                    failureFlash: true,
              }) ,function(req,res){
                  req.flash("error","Username or password is incorrect");
                  return res.redirect("/login");
          });
   

      //! Logout side

      app.get("/logout",function(req,res){
        req.logout();
        res.redirect("/");
       });

       //!middleware
       function authRole(role) {
        return (req, res, next) => {
          if (req.user.role !== role) {
            res.status(401);
            return res.render("notfound");
          }
          next();
        };
      }

       function isLoggedIn(req,res,next){
        if (req.isAuthenticated()) { 
          return next();
      }
      res.redirect('/login');
      }

  
    app.get("/:id",isLoggedIn,function(req,res){
      res.render("notfound");
    });



app.listen(port,function(){
  console.log("server Started");
});