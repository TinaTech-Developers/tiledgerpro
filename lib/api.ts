const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const apiFetch = async (url: string, options: any = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      alert("Session expired. Please login again.");
      window.location.href = "/login";
    }
    return;
  }

  return res.json();
};
