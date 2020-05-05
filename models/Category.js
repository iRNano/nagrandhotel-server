const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategorySchema = new Schema({
    name:{
        type:String,
        require: [true, "Category name is required"]
    }
})

module.exports = mongoose.model('Category', CategorySchema)