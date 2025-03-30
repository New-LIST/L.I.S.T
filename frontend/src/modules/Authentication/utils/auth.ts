export function logout() {
    removeStoredAuth();
    window.location.href = '/signin';
}
export function removeStoredAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
}

export function getStoredUser() {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    return sessionUser
        ? JSON.parse(sessionUser)
        : localUser
            ? JSON.parse(localUser)
            : null;
}

export function getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
}
