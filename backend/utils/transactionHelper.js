const mongoose = require("mongoose");

/**
 * Execute a function within a MongoDB transaction
 * @param {Function} callback - Async function to execute within transaction
 * @returns {Promise} Result of the callback function
 */
const withTransaction = async (callback) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Generate unique order number
 * @param {string} prefix - Prefix for order number (e.g., 'SO', 'PO')
 * @returns {string} Unique order number
 */
const generateOrderNumber = (prefix = "ORD") => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = {
  withTransaction,
  generateOrderNumber,
};
