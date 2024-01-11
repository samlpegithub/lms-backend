import express from 'express';
import { addAnswer, addQuestion, addReplyToReview, addReview, deleteCourse, editCourse, generateVideoUrl, getAllCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from '../controller/course_controller.js';
import { authorizRoles, isAuthenticated } from '../middleware/auth.js';
import { updateAccessToken } from '../controller/user_controller.js';
const courseRouter =express.Router();

courseRouter.post('/create-course',updateAccessToken,isAuthenticated,authorizRoles('admin'),uploadCourse);

courseRouter.put('/edit-course/:id',updateAccessToken,isAuthenticated,authorizRoles('admin'),editCourse);

courseRouter.get('/get-course/:id',getSingleCourse);

courseRouter.get('/get-courses',getAllCourse);

courseRouter.get('/get-course-content/:id',updateAccessToken,isAuthenticated,getCourseByUser);

courseRouter.put('/add-question',updateAccessToken,isAuthenticated,addQuestion);

courseRouter.put('/add-answer',updateAccessToken,isAuthenticated,addAnswer);

courseRouter.put('/add-review/:id',updateAccessToken,isAuthenticated,addReview);

courseRouter.put('/add-reply',updateAccessToken,isAuthenticated,authorizRoles('admin'),addReplyToReview);

courseRouter.get('/getAdminAllcourses',updateAccessToken,isAuthenticated,authorizRoles('admin'),getAllCourses);

courseRouter.post('/getVdoCipherOTP',generateVideoUrl);

courseRouter.delete('/delete-course/:id',updateAccessToken,isAuthenticated,authorizRoles('admin'),deleteCourse);







export default courseRouter; 