export type AuthUser = {
  id: string
  name: string
  email: string
  createdAt?: string
}

export type SignUpPayload = {
  name: string
  email: string
  password: string
}

export type SignInPayload = {
  email: string
  password: string
  /** When true (default), keep the user signed in on this device for up to 30 days. */
  rememberDevice?: boolean
}

export type SignInResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

