import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import Constants from "expo-constants";
import axios from "axios";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { API_URL } = Constants.expoConfig?.extra || {};

  const fetchUnreadCount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await axios.get(
        `${API_URL}/api/user/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnreadCount: fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
