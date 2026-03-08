const Party = require("../models/Party");
const { createAuditLog } = require("./auditService");
const { AUDIT_ACTIONS, ENTITY_TYPES } = require("../utils/constants");

/**
 * Create a new party (customer or supplier)
 * @param {Object} partyData - Party data
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<Party>}
 */
const createParty = async (partyData, adminId, req = null) => {
  const party = await Party.create(partyData);

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PARTY_CREATED,
    entityType: ENTITY_TYPES.PARTY,
    entityId: party._id,
    changes: { partyType: party.partyType, name: party.name },
    req,
  });

  return party;
};

/**
 * Update a party
 * @param {ObjectId} partyId - Party ID
 * @param {Object} updateData - Update data
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<Party>}
 */
const updateParty = async (partyId, updateData, adminId, req = null) => {
  const party = await Party.findById(partyId);

  if (!party) {
    throw new Error("Party not found");
  }

  const oldData = party.toObject();

  Object.assign(party, updateData);
  await party.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PARTY_UPDATED,
    entityType: ENTITY_TYPES.PARTY,
    entityId: partyId,
    changes: {
      before: { name: oldData.name, phone: oldData.phone },
      after: { name: party.name, phone: party.phone },
    },
    req,
  });

  return party;
};

/**
 * Soft delete a party
 * @param {ObjectId} partyId - Party ID
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<Party>}
 */
const deleteParty = async (partyId, adminId, req = null) => {
  const party = await Party.findById(partyId);

  if (!party) {
    throw new Error("Party not found");
  }

  party.isActive = false;
  await party.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PARTY_DELETED,
    entityType: ENTITY_TYPES.PARTY,
    entityId: partyId,
    changes: { isActive: false },
    req,
  });

  return party;
};

/**
 * Get all parties with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
const getParties = async (filters = {}, page = 1, limit = 20) => {
  const query = { isActive: true };

  if (filters.partyType) query.partyType = filters.partyType;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [parties, total] = await Promise.all([
    Party.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Party.countDocuments(query),
  ]);

  return {
    parties,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get party by ID
 * @param {ObjectId} partyId - Party ID
 * @returns {Promise<Party>}
 */
const getPartyById = async (partyId) => {
  const party = await Party.findById(partyId);

  if (!party) {
    throw new Error("Party not found");
  }

  return party;
};

module.exports = {
  createParty,
  updateParty,
  deleteParty,
  getParties,
  getPartyById,
};
