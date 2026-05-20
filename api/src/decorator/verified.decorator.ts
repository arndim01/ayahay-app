import { SetMetadata } from '@nestjs/common';

export const VERIFIED_KEY = 'verified';

// request.user by default must have a verified email to be able to call endpoints,
// but sometimes (e.g. register) we want this behavior while not required
// user's email to be verified
export const AllowUnverified = () => SetMetadata(VERIFIED_KEY, false);
