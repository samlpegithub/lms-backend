import mongoose, { Schema } from 'mongoose'


const faqSchema = new Schema({
    question: {
        type: String
    },
    answer: {
        type: String
    },
    
active: { type: Boolean, default: false }
})
const categorySchema = new Schema({
    title: {
        type: String
    }
})
const bannerImageSchema = new Schema({
    public_id: String,
    url: String
})

const layoutSchema = new Schema({
    type: {
        type: String
    },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {

        image: bannerImageSchema,

        title: {
            type: String
        },
        subTitle: {
            type: String
        }
    }


})


export const layoutModel = mongoose.model('layout', layoutSchema);