import { useEffect } from "react";
import axios from "axios";

// Helper to convert base64 to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const usePushNotifications = () => {
  useEffect(() => {
    const registerPushNotifications = async () => {
      // Check if service workers and push manager are supported
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notifications are not supported by the browser");
        return;
      }

      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Check current notification permission
        let permission = Notification.permission;

        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission !== "granted") {
          console.warn("Notification permission denied by user");
          return;
        }

        // Wait until the service worker is ready
        await navigator.serviceWorker.ready;

        // Get VAPID public key from env
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
          console.warn("VITE_VAPID_PUBLIC_KEY is missing in environment variables. Push notifications are disabled.");
          return;
        }

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // Determine user model (Teacher or Student based on where this hook is used)
        // A simple way is to check the current route or check localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return; // User not logged in

        let userModel = "Student";
        if (user.role === "teacher") userModel = "Teacher";
        if (user.role === "admin") userModel = "Admin";

        const token = localStorage.getItem("token");
        if (!token) return;

        // Send subscription to backend
        await axios.post(
          `${import.meta.env.VITE_API_URL}/push/subscribe`,
          {
            subscription,
            userModel,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Error registering push notifications:", error);
      }
    };

    registerPushNotifications();
  }, []);

  return null;
};

export default usePushNotifications;
