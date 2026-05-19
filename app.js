import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session'
import {User} from './models/User.js'
import passport from 'passport'
import LocalStrategy from 'passport-local'

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/login-system')
    .then(()=>console.log('Mongo Connected'))
    .catch(err=>console.log(err))

app.set('view engine','ejs')

app.use(express.urlencoded({extended:true}))

app.use(session({
    secret:'notagoodsecret',
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',
    passport.authenticate('local',{
        failureRedirect:'/login'
    }),
    (req,res)=>{
        res.redirect('/profile')
    }
)

const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    next()
}

app.get('/profile',isLoggedIn,(req,res)=>{
    console.log(req.user)
    res.render('profile',{username:req.user.username})
})

app.post('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        res.redirect('/login')
    })
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register',async(req,res)=>{
    const {username,password}=req.body
    const user=new User({username})
    const registeredUser=await User.register(user,password)
    req.login(registeredUser,(err)=>{
        if(err){
            return res.send(err)
        }
        res.redirect('/profile')
    })
})

app.listen(3000,()=>{
    console.log('Serving on port 3000')
})