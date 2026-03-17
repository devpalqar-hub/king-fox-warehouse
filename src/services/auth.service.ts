const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const loginRequest = async (email: string, password: string) => {

  const res = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
};