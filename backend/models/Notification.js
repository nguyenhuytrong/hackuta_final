const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }, // has the user read it?
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model('Notification', NotificationSchema);
