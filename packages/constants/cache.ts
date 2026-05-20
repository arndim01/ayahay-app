// Cached items that will be invalidated when user signs out
export const accountRelatedCacheKeys = <const>[
  'logged-in-account',
  'jwt',
  'my-notifications',
];

// Cached items that will only be invalidated if explicitly called
export const publicCacheKeys = <const>[
  'cabin-types',
  'ports',
  'ships',
  'shipping-lines',
  'vehicle-types',
  'trips',
  'trips-by-id',
  'rate-tables-by-id',
  'saved-bookings',
];

export const cacheKeys = <const>[
  ...accountRelatedCacheKeys,
  ...publicCacheKeys,
];

export type CacheKey = (typeof cacheKeys)[number];
