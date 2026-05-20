import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard(roles?: string[]) {
  const { loggedInAccount } = useAuth();

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    if (
      loggedInAccount === undefined ||
      loggedInAccount.role === 'Passenger'
    ) {
      redirect('/');
    } else if (roles && !roles.includes(loggedInAccount.role)) {
      redirect('/403');
    }
  }, [loggedInAccount]);
}
