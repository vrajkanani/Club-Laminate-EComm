/**
 * Standard success response formatter
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard error response formatter
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Additional error details
 */
const errorResponse = (
  res,
  message = "Error",
  statusCode = 500,
  errors = null,
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Skip and limit values
 */
const getPagination = (page = 1, limit = 20) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const skip = (pageNum - 1) * limitNum;

  return {
    skip,
    limit: limitNum,
    page: pageNum,
  };
};

/**
 * Format pagination metadata
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  successResponse,
  errorResponse,
  getPagination,
  getPaginationMeta,
};
