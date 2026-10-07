import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Video,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  Info,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const getNotificationIcon = (type) => {
  switch (type) {
    case "INTERVIEW":
      return Video;

    case "APPLICATION":
      return FileText;

    case "APPLICATION_STATUS":
      return CheckCheck;

    case "JOB":
      return BriefcaseBusiness;

    default:
      return Info;
  }
};

const getNotificationStyle = (type) => {
  switch (type) {
    case "INTERVIEW":
      return {
        bg: "bg-violet-50",
        text: "text-violet-600",
      };

    case "APPLICATION":
      return {
        bg: "bg-blue-50",
        text: "text-blue-600",
      };

    case "APPLICATION_STATUS":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
      };

    case "JOB":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
      };

    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
      };
  }
};

const formatTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const created = new Date(date);

  const diff = Math.floor(
    (now.getTime() - created.getTime()) / 1000
  );

  if (diff < 10) return "Just now";

  if (diff < 60) {
    return `${diff}s ago`;
  }

  const minutes = Math.floor(diff / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(
        response.data?.notifications || []
      );
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
  }, [user]);

  /*
   * Real-time notifications
   */
  useEffect(() => {
    if (!user?.id && !user?._id) return;

    const userId = user.id || user._id;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join:user", userId);
    });

    socket.on("notification:new", (notification) => {
      setNotifications((previous) => {
        const exists = previous.some(
          (item) => item._id === notification._id
        );

        if (exists) {
          return previous;
        }

        return [notification, ...previous];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  /*
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  const deleteNotification = async (
    event,
    id
  ) => {
    event.stopPropagation();

    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setOpen(false);

    /*
     * Interview notification
     */
    if (
      notification.type === "INTERVIEW" &&
      notification.relatedInterview
    ) {
      navigate(
        `/interview-room/${notification.relatedInterview}`
      );

      return;
    }

    /*
     * Application notification
     */
    if (
      notification.type === "APPLICATION_STATUS" &&
      notification.relatedApplication
    ) {
      const destination =
        user?.role === "RECRUITER"
          ? `/recruiter/applications/${notification.relatedApplication}`
          : `/job-seeker/applications/${notification.relatedApplication}`;

      navigate(destination);

      return;
    }

    /*
     * New application notification
     */
    if (
      notification.type === "APPLICATION" &&
      notification.relatedApplication
    ) {
      if (user?.role === "RECRUITER") {
        navigate(
          `/recruiter/applications/${notification.relatedApplication}`
        );
      } else {
        navigate(
          `/job-seeker/applications/${notification.relatedApplication}`
        );
      }

      return;
    }

    /*
     * Job notification
     */
    if (
      notification.type === "JOB" &&
      notification.relatedJob
    ) {
      navigate(
        `/job-seeker/jobs/${notification.relatedJob}`
      );
    }
  };

  const NotificationIcon = ({
    notification,
  }) => {
    const Icon = getNotificationIcon(
      notification.type
    );

    const style = getNotificationStyle(
      notification.type
    );

    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
      >
        <Icon size={18} />
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* Bell */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <>
            <span className="absolute right-2 top-1.5 h-2 w-2 animate-pulse rounded-full bg-red-500" />

            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-[#1f252d] bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-[70] w-[calc(100vw-1.5rem)] max-w-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h3 className="font-bold text-slate-900">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-lg px-2.5 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3"
                  >
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Bell size={24} />
                </div>

                <h4 className="mt-4 font-semibold text-slate-800">
                  No notifications
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  New applications, interview schedules and
                  updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isInterview =
                  notification.type ===
                  "INTERVIEW";

                return (
                  <div
                    key={notification._id}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`group relative cursor-pointer border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50 ${
                      !notification.isRead
                        ? "bg-indigo-50/40"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex gap-3">
                      <NotificationIcon
                        notification={notification}
                      />

                      <div className="min-w-0 flex-1 pr-5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              notification.isRead
                                ? "font-medium text-slate-700"
                                : "font-bold text-slate-900"
                            }`}
                          >
                            {notification.title ||
                              "Notification"}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {formatTimeAgo(
                              notification.createdAt
                            )}
                          </span>

                          {isInterview &&
                            notification.relatedInterview && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                                <Video size={12} />
                                Join Interview
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(event) =>
                          deleteNotification(
                            event,
                            notification._id
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-center text-[11px] text-slate-400">
                Click an interview notification to join the
                meeting
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;