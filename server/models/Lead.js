const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema(
  {
    first: { type: String, required: true, trim: true },
    last:  { type: String, required: true, trim: true },
    email: {
      type: String, required: true, trim: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
    },
    phone:   { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    source: {
      type: String,
      enum: ['Website Form','LinkedIn','Referral','Cold Email','Google Ads','Instagram','Demo Request','Other'],
      default: 'Website Form'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'lost'],
      default: 'new'
    },
    value:  { type: Number, default: 0, min: 0 },
    notes:  { type: [noteSchema], default: [] },
    tags:   { type: [String], default: [] },
    assignedTo: { type: String, default: '' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: full name
leadSchema.virtual('name').get(function () {
  return `${this.first} ${this.last}`;
});

// Index for fast search
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ first: 'text', last: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
