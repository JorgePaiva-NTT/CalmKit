export async function Get(url, token) {
  if (!token) return null;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-auth-token": token } : {}),
    },
  });
  return await res.json();
}

export async function Post(url, data, token) {
  if (!token) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-auth-token": token } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function Delete(url, token) {
  if (!token) return null;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-auth-token": token } : {}),
    },
  });
  return await res.json();
}
