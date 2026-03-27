const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Unauthenticated public routes for the website
router.get('/courses', publicController.getPublishedCourses);
router.get('/courses/:slug', publicController.getCourseDetails);

router.get('/blog', publicController.getPublishedBlogs);
router.get('/blog/:slug', publicController.getBlogDetails);

router.post('/contact', publicController.submitContactForm);

// Note: Registration and Payment points are handled separately or via another route file
module.exports = router;
