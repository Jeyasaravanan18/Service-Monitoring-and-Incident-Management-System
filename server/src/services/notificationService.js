import { Notification, User } from "../models/index.js";
import { dispatchNotificationDeliveries } from "./deliveryService.js";

export async function createWorkspaceNotification({ workspaceId, type, title, body = "", meta = {}, userId = null }) {
  if (userId) {
    const notification = await Notification.create({ workspaceId, userId, type, title, body, meta });
    const recipient = await User.findById(userId).select("email").lean();
    const deliveryResults = await dispatchNotificationDeliveries({
      recipients: recipient ? [recipient] : [],
      title,
      body,
      meta: { ...meta, workspaceId: String(workspaceId), userId: String(userId), type },
    });
    if (deliveryResults.length) {
      notification.meta = {
        ...(notification.meta || {}),
        deliveryResults,
      };
      await notification.save();
    }
    return notification;
  }

  const users = await User.find({ workspaceIds: { $in: [workspaceId] } }).select("_id email").lean();
  if (!users.length) return null;
  const notifications = await Notification.insertMany(
    users.map((user) => ({ workspaceId, userId: user._id, type, title, body, meta }))
  );
  const deliveryResults = await dispatchNotificationDeliveries({
    recipients: users,
    title,
    body,
    meta: { ...meta, workspaceId: String(workspaceId), type },
  });
  if (deliveryResults.length) {
    const deliveryMap = new Map();
    for (const result of deliveryResults) {
      if (!deliveryMap.has(result.channel)) deliveryMap.set(result.channel, []);
      deliveryMap.get(result.channel).push(result);
    }
    await Notification.updateMany(
      { _id: { $in: notifications.map((item) => item._id) } },
      { $set: { "meta.deliveryResults": deliveryResults } }
    );
  }
  return notifications;
}
