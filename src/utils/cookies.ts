
// Set a cookie with a given name, value, and expiration days
export const setCookie = (name: string, value: string, days: number = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

// Get a cookie value by name
export const getCookie = (name: string): string | null => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  
  return null;
};

// Delete a cookie by setting its expiration to the past
export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Save the last viewed bookshelf tab
export const saveLastBookshelfTab = (tabName: string) => {
  setCookie('lastBookshelfTab', tabName);
};

// Get the last viewed bookshelf tab
export const getLastBookshelfTab = (): string => {
  return getCookie('lastBookshelfTab') || 'reading';
};

// Save the last selected explore filter/tab
export const saveLastExploreTab = (tabName: string) => {
  setCookie('lastExploreTab', tabName);
};

// Get the last selected explore filter/tab
export const getLastExploreTab = (): string => {
  return getCookie('lastExploreTab') || 'trending';
};

// Save the last selected explore genre filter
export const saveLastExploreGenre = (genre: string) => {
  setCookie('lastExploreGenre', genre);
};

// Get the last selected explore genre filter
export const getLastExploreGenre = (): string | null => {
  return getCookie('lastExploreGenre');
};
