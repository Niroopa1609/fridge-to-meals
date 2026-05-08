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
}

export type SignInResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

