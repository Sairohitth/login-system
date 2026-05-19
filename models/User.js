import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema=new mongoose.Schema({
    
})

userSchema.plugin(passportLocalMongoose.default)

export const User=mongoose.model('User',userSchema)