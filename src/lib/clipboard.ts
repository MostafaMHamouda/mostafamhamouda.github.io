export const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  } catch {
    return false;
  }
};

export const buildAppRouteUrl = (route: string) => {
  if (typeof window === 'undefined') return route;
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  if (window.location.protocol === 'file:') {
    return `${window.location.href.split('#')[0]}#${cleanRoute}`;
  }
  return `${window.location.origin}${cleanRoute}`;
};
