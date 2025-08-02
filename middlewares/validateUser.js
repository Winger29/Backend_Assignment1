const Joi = require("joi");

// Schema for signup
const signupSchema = Joi.object({
  role: Joi.string().valid("senior", "staff", "organiser").required(),
  fullName: Joi.string().min(1).max(100).required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name cannot be empty"
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be valid"
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/)
    .required()
    .messages({
      "string.pattern.base": "Password must contain uppercase, lowercase, number and special character",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required"
    }),
  profileImage: Joi.string().allow(""),

  dob: Joi.when("role", {
    is: "senior",
    then: Joi.date().required().messages({ "any.required": "Date of birth is required" }),
    otherwise: Joi.forbidden()
  }),
  interests: Joi.when("role", {
    is: "senior",
    then: Joi.string().required().messages({ "any.required": "Interests are required" }),
    otherwise: Joi.forbidden()
  }),

  staffId: Joi.when("role", {
    is: "staff",
    then: Joi.string().required().messages({ "any.required": "Staff ID is required" }),
    otherwise: Joi.forbidden()
  }),
  clinicId: Joi.when("role", {
    is: "staff",
    then: Joi.string().required().messages({ "any.required": "Clinic ID is required" }),
    otherwise: Joi.forbidden()
  }),

  contactNumber: Joi.when("role", {
    is: "organiser",
    then: Joi.string()
      .pattern(/^\d{8}$/)
      .required()
      .messages({
        "string.pattern.base": "Contact number must be 8 digits",
        "any.required": "Contact number is required"
      }),
    otherwise: Joi.forbidden()
  })
});

// Schema for login
const loginSchema = Joi.object({
  role: Joi.string().valid("senior", "staff", "organiser").required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Schema for profile update
const updateSchema = Joi.object({
  fullName: Joi.string().required(),
  password: Joi.string()
    .allow("", null)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/)
    .messages({
      "string.pattern.base": "Password must include upper, lower, number and special character"
    }),

  interests: Joi.string().allow("", null),
  position: Joi.string().allow("", null),
  contactNumber: Joi.string().pattern(/^\d{8}$/).allow("", null)
});

// ========== Middleware Functions ==========

function validateSignup(req, res, next) {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(e => e.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(e => e.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

function validateUpdate(req, res, next) {
  const { error } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(e => e.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateUpdate
};
