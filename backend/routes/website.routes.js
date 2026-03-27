const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/website.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect all website management routes
router.use(protect);
router.use(authorize(['super_admin', 'branch_admin', 'hr']));

// Blog Posts
router.get('/blogs', websiteController.getAllBlogPosts);
router.post('/blogs', websiteController.createBlogPost);
router.put('/blogs/:id', websiteController.updateBlogPost);
router.delete('/blogs/:id', websiteController.deleteBlogPost);

// Courses (Website specific settings)
router.get('/courses', websiteController.getWebsiteCourses);
router.put('/courses/:id', websiteController.updateWebsiteCourse);

module.exports = router;
