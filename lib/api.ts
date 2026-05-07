export const apiFetch = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("API ERROR:", data);
    throw new Error(data?.error || "API Error");
  }

  return data;
};
