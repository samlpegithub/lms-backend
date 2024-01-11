import { catchAsyncError } from "../catchAsyncError.js";
import cloundinary from 'cloudinary';
import { layoutModel } from "../models/Layout.js";
import ErrorHandler from "../ErrorHandler.js";


//create layout  --only for admin
export const createLayout = catchAsyncError(async (req, res, next) => {

    try {
        const { type } = req.body;
        const isTypeExit = await layoutModel.findOne({ type });
        if (isTypeExit) {
            return next(new ErrorHandler(`${type} already exit`, 400));

        }

        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;
            const mycloud = await cloundinary.v2.uploader.upload(image, {
                folder: "layout"
            })
            const banner = {
                type:"Banner",
                banner: {
                    image: {
                        public_id: mycloud.public_id,
                        url: mycloud.secure_url
                    },
                    title,
                    subTitle
                }
            }
            await layoutModel.create(banner);
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            // const faqItem=faq.map((item)=>{
            //     return {
            //         question:item.question,
            //         answer:item.answer
            //     }
            // })
            await layoutModel.create({ type, faq });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            await layoutModel.create({ type, categories });
        }
        res.status(200).json({
            success: true,
            message: "Layout created successfully"

        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//edit layout --only for admin
export const editLayout = catchAsyncError(async (req, res, next) => {
    try {
        const { type } = req.body;

        if (type==='Banner') {
            const { image, title, subTitle } = req.body;
            const bannerData = await layoutModel.findOne({type});
            
            if(bannerData && !image.startsWith('https')){
                
                
                await cloundinary.v2.uploader.destroy(bannerData.banner.image.public_id)
                
                const mycloud = await cloundinary.v2.uploader.upload(image, {
                    folder: "layout"
                })
            bannerData.banner = {
                    image: {
                        public_id: mycloud.public_id,
                        url: mycloud.secure_url
                    },
                    title:title,
                    subTitle:subTitle
            }
        

           }
           if(image.startsWith('https')){
            bannerData.banner = {
                
                    image: {
                        public_id:bannerData?.banner?.image?.public_id,
                        url: bannerData?.banner?.image?.url
                    },
                    title:title,
                    subTitle:subTitle
                
           }
        }
       await  layoutModel.findByIdAndUpdate(bannerData._id,{$set:bannerData},{new:true})
    }
        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqData = await layoutModel.findOne({ type });
            const faqItem = faq.map((item) => {
                return {
                    question: item.question,
                    answer: item.answer
                }
            })
            await layoutModel.findByIdAndUpdate(faqData._id, { type, faq: faqItem });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesData = await layoutModel.findOne({ type });
            const categoriesItem = categories.map((item) => {
                return {
                    title: item.title
                }
            })
            await layoutModel.findByIdAndUpdate(categoriesData._id, { type, categories: categoriesItem });
        }
        res.status(200).json({
            success: true,
            message: "Layout Updated successfully"

        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


//get layout by type
export const getLayout = catchAsyncError(async (req, res, next) => {
    try {
        const layout = await layoutModel.findOne({ type: req.params.type })
        res.status(200).json({
            success: true,
            layout
        })
    } catch (error) {

        return next(new ErrorHandler(error.message, 500));
    }
})