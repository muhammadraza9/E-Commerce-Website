const prisma = require("../config/db");

const createActivityLog = async ({
  adminId = null,
  adminEmail = null,
  action,
  entity,
  entityId = null,
  message,
}) => {
  try {
    if (!action || !entity || !message) return null;

    return await prisma.activitylog.create({
      data: {
        adminId: adminId ? Number(adminId) : null,
        adminEmail: adminEmail?.trim().toLowerCase() || null,
        action: action.trim(),
        entity: entity.trim(),
        entityId: entityId !== null ? String(entityId) : null,
        message: message.trim(),
      },
    });
  } catch (error) {
    console.error("Create activity log error:", error.message);
    return null;
  }
};

module.exports = createActivityLog;