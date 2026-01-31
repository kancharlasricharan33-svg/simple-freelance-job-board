const { userSchemas, jobSchemas, bidSchemas, ratingSchemas } = require('./schemas');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Specific validation middleware
const validateUser = {
  register: validate(userSchemas.register),
  login: validate(userSchemas.login),
  updateProfile: validate(userSchemas.updateProfile),
  updatePassword: validate(userSchemas.updatePassword)
};

const validateJob = {
  create: validate(jobSchemas.create),
  update: validate(jobSchemas.update)
};

const validateBid = {
  create: validate(bidSchemas.create),
  update: validate(bidSchemas.update)
};

const validateRating = {
  create: validate(ratingSchemas.create)
};

module.exports = {
  validateUser,
  validateJob,
  validateBid,
  validateRating
};