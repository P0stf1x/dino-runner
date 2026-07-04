// This function was completely generated with ChatGPT. I'm not a JS dev and frankly I hate it and don't even want to touch it
// ^ Как говорится, «Что ты мне сделаешь, я в другом городе»
export function uid_get_or_new() {
  const COOKIE_NAME = "uid";

  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp("(^|;\\s*)" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  let uid = getCookie(COOKIE_NAME);

  if (!uid) {
    uid = crypto.randomUUID(); // UUID v4
    setCookie(COOKIE_NAME, uid);
  }

  console.log("UID:", uid);

  // uid is now available for use
  return uid;
}