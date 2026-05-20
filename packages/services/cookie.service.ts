export function getCookieByName(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) {
    return undefined;
  }
  return parts.pop()?.split(';').shift();
}

export function setCookieForAllSubdomains(
  cookieName: string,
  cookieValue: string
) {
  const baseDomain = location.hostname
    .split('.')
    .reverse()
    .splice(0, 2)
    .reverse()
    .join('.');
  document.cookie = `${cookieName}=${cookieValue};domain=.${baseDomain};path=/`;
}
