'use client';
import { useAuthGuard } from '@/hooks/auth';

export default function Unauthorized() {
  useAuthGuard();

  return (
    <div>
      <h2>Error 403 - Forbidden</h2>
      <h1>Access to this resource is denied!</h1>
    </div>
  );
}
