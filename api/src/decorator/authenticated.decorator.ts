import { SetMetadata } from '@nestjs/common';

export const AUTHENTICATED_KEY = 'authenticated';

// setting request.user to the logged-in account is done in AuthGuard,
// but sometimes (e.g. booking) we want this behavior while not requiring
// the user to be logged in
export const AllowUnauthenticated = () => SetMetadata(AUTHENTICATED_KEY, false);
