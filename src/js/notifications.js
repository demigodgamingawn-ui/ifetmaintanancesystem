// src/js/notifications.js - In-App Notification Engine & Badge Manager

import { db } from './db.js';

export class NotificationsManager {
  notify(userId, requestId, title, message) {
    const notifications = db.getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      user_id: userId,
      request_id: requestId,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString()
    };

    notifications.unshift(newNotif);
    db.saveNotifications(notifications);
    return newNotif;
  }

  getUserNotifications(userId) {
    const notifications = db.getNotifications();
    return notifications.filter(n => n.user_id === userId);
  }

  getUnreadCount(userId) {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.is_read).length;
  }

  markAsRead(notificationId) {
    const notifications = db.getNotifications();
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      db.saveNotifications(notifications);
    }
  }

  markAllAsRead(userId) {
    const notifications = db.getNotifications();
    notifications.forEach(n => {
      if (n.user_id === userId) {
        n.is_read = true;
      }
    });
    db.saveNotifications(notifications);
  }

  clearUserNotifications(userId) {
    let notifications = db.getNotifications();
    notifications = notifications.filter(n => n.user_id !== userId);
    db.saveNotifications(notifications);
  }
}

export const notificationsManager = new NotificationsManager();
