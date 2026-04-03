const Course = require('../models/Course');
const BlogPost = require('../models/BlogPost');
const Batch = require('../models/Batch');
const Lead = require('../models/Lead');
const { Op } = require('sequelize');
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
    const isId = /^\d+$/.test(slug);
    
    const course = await Course.findOne({
      where: {
        [Op.or]: [
          { slug: slug },
          ...(isId ? [{ id: parseInt(slug, 10) }] : [])
        ],
        is_published: true,
        status: 'active'
      },
      include: [
        {
          model: Batch,
          where: { status: { [Op.in]: ['enrolling', 'starting_soon'] } },
          required: false,
          attributes: ['id', 'name', 'start_date', 'schedule', 'capacity', 'enrolled']
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
    const { name, email, phone, subject, message, course_interest, destination_country } = req.body;

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
      destination_country,
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

exports.getCourseBatches = async (req, res) => {
  try {
    const { slug } = req.params;
    const isId = /^\d+$/.test(slug);
    
    const course = await Course.findOne({
      where: { 
        [Op.or]: [
          { slug: slug },
          ...(isId ? [{ id: parseInt(slug, 10) }] : [])
        ],
        is_published: true, 
        status: 'active' 
      }
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const batches = await Batch.findAll({
      where: { course_id: course.id, status: { [Op.in]: ['enrolling', 'starting_soon'] } },
      attributes: ['id', 'name', 'start_date', 'schedule', 'capacity', 'enrolled'],
      order: [['start_date', 'ASC']]
    });
    
    res.json(batches);
  } catch (err) {
    console.error('Error fetching course batches:', err);
    res.status(500).json({ message: 'Error fetching course batches' });
  }
};

exports.submitCourseEnquiry = async (req, res) => {
  try {
    const { course_id, batch_id, name, email, phone, message, destination_country } = req.body;
    let course = null;
    let dealValue = 0;
    
    if (course_id) {
       course = await Course.findByPk(course_id);
       if (course) dealValue = course.base_fee;
    }
    
    let batchName = '';
    if (batch_id) {
       const batch = await Batch.findByPk(batch_id);
       if (batch) batchName = batch.name;
    }

    let score = 30;
    if (phone) score += 20;
    if (email) score += 15;

    const lead = await Lead.create({
      branch_id: 1, // default HQ
      name,
      email,
      phone,
      destination_country,
      source: 'website',
      status: 'interested',
      priority: 'high',
      score,
      course_id: course_id || null,
      batch_id: batch_id || null,
      batch_interest: batchName,
      deal_value: dealValue,
      notes: message ? `Enquiry Message: ${message}` : '',
      last_activity_at: new Date(),
    });

    res.status(201).json({ message: 'Enquiry submitted successfully! We will get in touch shortly.', leadId: lead.id });
  } catch (err) {
    console.error('Error submitting course enquiry:', err);
    res.status(500).json({ message: 'Error submitting course enquiry' });
  }
};
