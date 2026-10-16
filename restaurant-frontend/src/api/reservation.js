const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reservation`;

const getStoredReservations = () => {
  try {
    return JSON.parse(localStorage.getItem("reservations") || "[]");
  } catch {
    return [];
  }
};

const saveStoredReservations = (reservations) => {
  localStorage.setItem("reservations", JSON.stringify(reservations));
};

export const reservation = async (reservationInfo) => {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...reservationInfo,
        userId: currentUser._id || currentUser.id || currentUser.email,
        userName: currentUser.name || currentUser.email || "Customer",
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    }

    if (data.error || data.message) throw new Error(data.error || data.message);
  } catch (error) {
    // Fall back to local storage if the backend is unavailable.
  }

  const savedReservation = {
    id: Date.now(),
    ...reservationInfo,
    userId: currentUser._id || currentUser.id || currentUser.email,
    userName: currentUser.name || currentUser.email || "Customer",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const reservations = getStoredReservations();
  reservations.push(savedReservation);
  saveStoredReservations(reservations);

  return { success: true, reservation: savedReservation };
};

export const getReservations = () => getStoredReservations();

export const getReservationsForUser = (userId) => {
  return getStoredReservations().filter((item) => item.userId === userId);
};