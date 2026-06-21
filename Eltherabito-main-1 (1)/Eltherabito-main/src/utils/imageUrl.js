const ASSET_BASE_URL = 'https://mentalhealth01.runasp.net';

// Backend endpoints return picture/photo fields as a path (e.g. "/Images/Doctors/xyz.jpg").
// This turns that path into a full, displayable URL, falling back when there's no picture.
export function getPictureUrl(pictureUrl, fallback = null) {
  if (!pictureUrl) {
    return fallback;
  }
  if (/^https?:\/\//i.test(pictureUrl)) {
    return pictureUrl;
  }
  return `${ASSET_BASE_URL}${pictureUrl.startsWith('/') ? '' : '/'}${pictureUrl}`;
}

// Generates a consistent "initials on a gradient" avatar for anyone (doctor or
// patient) who hasn't uploaded a real profile photo yet, instead of a static stock photo.
export function getInitialsAvatar(name) {
  const seed = encodeURIComponent((name || '').trim() || 'User');
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear&backgroundColor=2563eb,1e40af,0ea5e9&textColor=ffffff&fontWeight=600`;
}

// Real uploaded photo if there is one, otherwise an initials avatar generated from the name.
export function getAvatarUrl(pictureUrl, name) {
  return getPictureUrl(pictureUrl, getInitialsAvatar(name));
}
