import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session'
import bcrypt from 'bcrypt'
import {User} from './models/User.js'

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

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',async(req,res)=>{
    const {username,password}=req.body
    const user=await User.findOne({username:username})
    if(!user){
        return res.send('Invalid username')
    }
    const validPassword=await bcrypt.compare(password,user.password)
    if(!validPassword){
        return res.send('Invalid password')
    }
    req.session.user_id=user._id
    // console.log("login",req.session)
    res.redirect('/profile')
})

const isLoggedIn=(req,res,next)=>{
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next()
}

app.get('/profile',isLoggedIn,async(req,res)=>{
    // console.log("profile",req.session)
    const user=await User.findById(req.session.user_id)
    res.render('profile',{username:user.username})
})

app.post('/logout',(req,res)=>{
    // console.log("before destroying")
    // console.log(req.session)
    req.session.destroy(()=>{
        // console.log("session destroyed")
        // console.log("session :",req.session)
        res.redirect('/login')
    })
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register',async(req,res)=>{
    const {username,password}=req.body
    const hashed=await bcrypt.hash(password,12)
    const user=new User({username,password:hashed})
    await user.save()
    req.session.user_id=user._id
    res.redirect('/profile')
})

app.listen(3000,()=>{
    console.log('Serving on port 3000')
})