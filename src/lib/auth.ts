let _token: string | null = null

export function setAuthToken(t: string | null): void { _token = t }
export function getAuthToken(): string | null { return _token }
