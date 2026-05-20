export const VOYAGE_FEATURE_COOKIE = 'voyageFeatureEnabled';

export const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
  return cookieValue ? cookieValue.split('=')[1] : null;
};
