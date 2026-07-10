const prisma = require("../config/db");

// ==========================
// Get Activity Logs
// ==========================

exports.getActivityLogs = async (req, res) => {
  try {
    const {
      search = "",
      action = "",
      entity = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(Number.parseInt(page) || 1, 1);
    const pageLimit = Math.max(Number.parseInt(limit) || 20, 1);

    const where = {};

    if (search.trim()) {
      where.OR = [
        { adminEmail: { contains: search.trim() } },
        { message: { contains: search.trim() } },
        { entityId: { contains: search.trim() } },
      ];
    }

    if (action && action !== "All") {
      where.action = action;
    }

    if (entity && entity !== "All") {
      where.entity = entity;
    }

    const [logs, totalLogs] = await Promise.all([
      prisma.activitylog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageLimit,
        take: pageLimit,
      }),

      prisma.activitylog.count({ where }),
    ]);

    res.json({
      logs,
      currentPage,
      totalPages: Math.ceil(totalLogs / pageLimit),
      totalLogs,
    });
  } catch (error) {
    console.error("Get activity logs error:", error.message);

    res.status(500).json({
      message: "Failed to load activity logs",
      error: error.message,
    });
  }
};

// ==========================
// Delete Activity Log
// ==========================

exports.deleteActivityLog = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid activity log ID",
      });
    }

    const log = await prisma.activitylog.findUnique({
      where: { id },
    });

    if (!log) {
      return res.status(404).json({
        message: "Activity log not found",
      });
    }

    await prisma.activitylog.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Activity log deleted successfully",
    });
  } catch (error) {
    console.error("Delete activity log error:", error.message);

    res.status(500).json({
      message: "Failed to delete activity log",
      error: error.message,
    });
  }
};

// ==========================
// Clear Activity Logs
// ==========================

exports.clearActivityLogs = async (req, res) => {
  try {
    await prisma.activitylog.deleteMany();

    res.json({
      success: true,
      message: "All activity logs cleared successfully",
    });
  } catch (error) {
    console.error("Clear activity logs error:", error.message);

    res.status(500).json({
      message: "Failed to clear activity logs",
      error: error.message,
    });
  }
};