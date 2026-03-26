const Issue = require('../models/Issue');
const DeliveryTask = require('../models/DeliveryTask'); // Updated from Order
const User = require('../models/Rider');
const Notification = require('../models/Notification');

/*
1) FETCH CONTACTS
GET /api/support/contact/:orderId
*/
exports.fetchContact = async (req, res) => {
    try {
        // Find task using primary key
        const task = await DeliveryTask.findByPk(req.params.orderId);

        if (!task) {
            return res.status(404).json({ success: false, message: "Delivery task not found" });
        }

        let emergencyContact = null;

        // Find rider if assigned to get emergency contact info
        if (task.rider_id) {
            const rider = await User.findByPk(task.rider_id, {
                attributes: ["emergency_contact"] 
            });
            emergencyContact = rider ? rider.emergency_contact : null;
        }

        res.json({
            success: true,
            data: {
                pickupContact: task.pickup_contact || null, 
                receiverContact: task.receiver_contact || null, 
                emergencyContact
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/*
2) REPORT ISSUE
POST /api/support/report-issue
*/
exports.reportIssue = async (req, res) => {
    try {
        const { orderId, title, issue } = req.body;

        if (!orderId || !title || !issue) {
            return res.status(400).json({
                success: false,
                message: "orderId, title and issue are required"
            });
        }

        const task = await DeliveryTask.findByPk(orderId);

        if (!task) {
            return res.status(404).json({ success: false, message: "Delivery task not found" });
        }

        // Check if the user is authorized to report for this task
        if (task.rider_id && task.rider_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to report issues for this task"
            });
        }

        const created = await Issue.create({
            user_id: req.user.id,
            reference_id: orderId,
            reference_type: 'DeliveryTask',
            title: title,
            description: issue,
            status: "in_review"
        });

        // Use correct underscored fields for Notification
        await Notification.create({
            user_id: req.user.id,
            reference_id: orderId,
            reference_type: 'DeliveryTask',
            notification_type: "system",
            title: `Issue: ${title}`,
            channel: "push",
            message: `Issue recorded for package ${task.package_number || orderId}`,
            sent_at: new Date()
        });

        res.status(201).json({ success: true, data: created });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};




/*
3) FETCH MY NOTIFICATIONS
*/
exports.fetchMyNotifications = async (req, res) => {
    try {
        const notes = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]] // Corrected from timeSent
        });

        res.json({
            success: true,
            count: notes.length,
            data: notes
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const [updated] = await Notification.update(
            { 
                is_read: true, 
                read_at: new Date() 
            },
            { 
                where: { 
                    id: id, 
                    user_id: req.user.id 
                } 
            }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.markAllRead = async (req, res) => {
    try {
        await Notification.update(
            { 
                is_read: true, 
                read_at: new Date() 
            },
            { 
                where: { 
                    user_id: req.user.id, 
                    is_read: false // Only update what isn't already read
                } 
            }
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Notification.destroy({
            where: { 
                id: id, 
                user_id: req.user.id 
            }
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};





/*
4) ADMIN FETCH ALL ISSUES
*/
exports.adminFetchIssues = async (req, res) => {
    try {
        const orderDirection = (req.query.sort || "DESC").toUpperCase();

        const issues = await Issue.findAll({
            include: [
                {
                    model: User,
                    attributes: ["fname", "lname", "phone_number", "email"]
                },
                {
                    model: DeliveryTask,
                    attributes: ["package_number", "status"]
                }
            ],
            order: [["created_at", orderDirection]]
        });

        res.json({ success: true, count: issues.length, data: issues });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// controllers/supportController.js

// Make sure it is "adminFetchIssues" NOT just "fetchIssues"
exports.adminFetchIssues = async (req, res) => {
    try {
        const issues = await Issue.findAll({
            include: [
                { model: User, attributes: ["fname", "lname"] },
                { model: DeliveryTask, attributes: ["package_number"] }
            ],
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: issues });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.adminFetchOneIssue = async (req, res) => {
    try {
        const issue = await Issue.findByPk(req.params.issueId, {
            include: [{ model: User }, { model: DeliveryTask }]
        });
        if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
        res.json({ success: true, data: issue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};