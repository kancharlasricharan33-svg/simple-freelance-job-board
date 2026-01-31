const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('client', 'freelancer').required().messages({
      'any.only': 'Role must be either client or freelancer',
      'any.required': 'Role is required'
    }),
    profile: Joi.object({
      bio: Joi.string().max(500).optional().messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
      skills: Joi.array().items(Joi.string().trim()).optional(),
      portfolio: Joi.string().uri().optional().messages({
        'string.uri': 'Please provide a valid URL for portfolio'
      }),
      avatar: Joi.string().uri().optional().messages({
        'string.uri': 'Please provide a valid URL for avatar'
      })
    }).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    profile: Joi.object({
      bio: Joi.string().max(500).optional().messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
      skills: Joi.array().items(Joi.string().trim()).optional(),
      portfolio: Joi.string().uri().optional().messages({
        'string.uri': 'Please provide a valid URL for portfolio'
      }),
      avatar: Joi.string().uri().optional().messages({
        'string.uri': 'Please provide a valid URL for avatar'
      })
    }).optional()
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required'
    })
  })
};

// Job validation schemas
const jobSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(100).required().messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
    description: Joi.string().min(20).max(2000).required().messages({
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
    category: Joi.string().valid('design', 'writing', 'development', 'marketing', 'data', 'other').required().messages({
      'any.only': 'Category must be one of: design, writing, development, marketing, data, other',
      'any.required': 'Category is required'
    }),
    budget: Joi.object({
      min: Joi.number().min(0).optional().messages({
        'number.min': 'Minimum budget cannot be negative'
      }),
      max: Joi.number().min(0).optional().messages({
        'number.min': 'Maximum budget cannot be negative'
      })
    }).optional(),
    duration: Joi.string().valid('less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months').optional(),
    skillsRequired: Joi.array().items(Joi.string().trim()).optional(),
    attachments: Joi.array().items(Joi.object({
      filename: Joi.string().required(),
      url: Joi.string().uri().required()
    })).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(100).optional().messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 100 characters'
    }),
    description: Joi.string().min(20).max(2000).optional().messages({
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    category: Joi.string().valid('design', 'writing', 'development', 'marketing', 'data', 'other').optional().messages({
      'any.only': 'Category must be one of: design, writing, development, marketing, data, other'
    }),
    budget: Joi.object({
      min: Joi.number().min(0).optional().messages({
        'number.min': 'Minimum budget cannot be negative'
      }),
      max: Joi.number().min(0).optional().messages({
        'number.min': 'Maximum budget cannot be negative'
      })
    }).optional(),
    duration: Joi.string().valid('less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months').optional(),
    skillsRequired: Joi.array().items(Joi.string().trim()).optional()
  }).min(1)
};

// Bid validation schemas
const bidSchemas = {
  create: Joi.object({
    amount: Joi.number().min(0).required().messages({
      'number.min': 'Bid amount cannot be negative',
      'any.required': 'Bid amount is required'
    }),
    duration: Joi.string().valid('less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months').required().messages({
      'any.only': 'Duration must be valid',
      'any.required': 'Duration is required'
    }),
    message: Joi.string().max(500).optional().messages({
      'string.max': 'Message cannot exceed 500 characters'
    })
  }),

  update: Joi.object({
    status: Joi.string().valid('accepted', 'rejected').required().messages({
      'any.only': 'Status must be either accepted or rejected',
      'any.required': 'Status is required'
    })
  })
};

// Rating validation schemas
const ratingSchemas = {
  create: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
    feedback: Joi.string().max(1000).optional().messages({
      'string.max': 'Feedback cannot exceed 1000 characters'
    }),
    quality: Joi.number().min(1).max(5).optional().messages({
      'number.min': 'Quality rating must be at least 1',
      'number.max': 'Quality rating cannot exceed 5'
    }),
    communication: Joi.number().min(1).max(5).optional().messages({
      'number.min': 'Communication rating must be at least 1',
      'number.max': 'Communication rating cannot exceed 5'
    }),
    professionalism: Joi.number().min(1).max(5).optional().messages({
      'number.min': 'Professionalism rating must be at least 1',
      'number.max': 'Professionalism rating cannot exceed 5'
    })
  })
};

module.exports = {
  userSchemas,
  jobSchemas,
  bidSchemas,
  ratingSchemas
};