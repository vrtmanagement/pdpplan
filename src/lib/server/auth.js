import { cookies } from "next/headers";

export const AUTH_COOKIE = "pdp_auth";

export function isValidCredentials(username, password) {
  return (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  );
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return token === "ok";
}

