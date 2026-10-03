export const featureFlags = {
  realtimeChat: false,
  webrtcCalls: false,
  /** Buyer Google sign-in; on when an OAuth Web client ID is configured. */
  googleOAuth: Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()),
  weChatOAuth: false,
  paidVideoCdn: false,
} as const;
