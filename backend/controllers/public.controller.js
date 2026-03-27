const Course = require('../models/Course');
const BlogPost = require('../models/BlogPost');
const Batch = require('../models/Batch');
const Lead = require('../models/Lead');
const sequelize = require('../config/db.config');

exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: {
        is_published: true,
        status: 'active'
      },
      attributes: ['id', 'title', 'slug', 'category', 'level', 'base_fee', 'duration_weeks', 'image_url', 'short_description']
    });
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({
      where: {
        slug: slug,
        is_published: true,
        status: 'active'
      },
      include: [
        {
          model: Batch,
          where: { status: 'upcoming' },
          required: false, // Don't fail if no upcoming batches
          attributes: ['id', 'name', 'start_date', 'fee', 'schedule', 'capacity', 'enrolled']
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error('Error fetching course details:', err);
    res.status(500).json({ message: 'Error fetching course details' });
  }
};

exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.findAll({
      where: { is_published: true },
      order: [['published_at', 'DESC']],
      attributes: ['id', 'title', 'slug', 'excerpt', 'image_url', 'published_at']
    });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

exports.getBlogDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await BlogPost.findOne({
      where: { slug: slug, is_published: true }
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog details:', err);
    res.status(500).json({ message: 'Error fetching blog details' });
  }
};

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message, course_interest } = req.body;

    // Calculate a basic score: +20 for phone, +15 for email, +15 for course interest
    let score = 20;
    if (phone) score += 20;
    if (email) score += 15;
    if (course_interest || subject) score += 15;

    const lead = await Lead.create({
      branch_id: 1, // default HQ branch — website leads go to branch 1
      name,
      email,
      phone,
      source: 'Website Enquiry',
      status: 'new',
      priority: 'medium',
      score,
      batch_interest: course_interest || subject || '',
      notes: `Subject: ${subject}\nMessage: ${message}`,
      last_activity_at: new Date(),
    });

    res.status(201).json({ message: 'Enquiry submitted successfully! We will contact you shortly.', leadId: lead.id });
  } catch (err) {
    console.error('Error submitting contact form:', err);
    res.status(500).json({ message: 'Error submitting contact form' });
  }
};
