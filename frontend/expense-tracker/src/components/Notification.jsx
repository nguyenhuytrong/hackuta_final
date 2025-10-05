import { useEffect, useState } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH', // ✅ PATCH now matches backend
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        // Update frontend state
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 && <p>No notifications yet.</p>}
      {notifications.map((n) => (
        <div
          key={n._id}
          style={{
            background: n.read ? '#f0f0f0' : '#fff7c0',
            border: '1px solid #ddd',
            padding: '10px',
            marginBottom: '5px',
            borderRadius: '5px',
          }}
        >
          <strong>{n.title}</strong>
          <p>{n.message}</p>
          {!n.read && (
            <button onClick={() => markAsRead(n._id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
}
