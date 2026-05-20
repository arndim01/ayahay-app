'use client';
import { setCookie, VOYAGE_FEATURE_COOKIE } from '@/utils/cookies';
import {
  User,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { firebase } from '@/utils/initFirebase';
import { useIdToken } from 'react-firebase-hooks/auth';
import { accountRelatedCacheKeys } from '@ayahay/constants';
import { cacheItem, invalidateItem } from '@ayahay/services/cache.service';
import { IAccount } from '@ayahay/models';
import { getAccountInformation } from '@ayahay/services/account.service';

const AuthContext = createContext({
  currentUser: null as User | undefined | null,
  // loggedInAccount is null if it's loading
  loggedInAccount: null as IAccount | undefined | null,
  hasPrivilegedAccess: false,
  signIn: (email: string, password: string) => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, loading] = useIdToken(firebase);
  const [loggedInAccount, setLoggedInAccount] = useState<
    IAccount | undefined | null
  >(null);
  const [hasPrivilegedAccess, setHasPrivilegedAccess] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }
    fetchAccountInformation();
  }, [currentUser, loading]);

  const fetchAccountInformation = async () => {
    if (currentUser) {
      // force refresh so that user claims (with role) is always updated on login
      const jwt = await currentUser.getIdToken(true);
      cacheItem('jwt', jwt);
      const myAccountInformation = await getAccountInformation();
      console.log('AuthContext - Account information loaded:', {
        email: myAccountInformation?.email,
        role: myAccountInformation?.role,
        shippingLineId: myAccountInformation?.shippingLineId,
      });
      setLoggedInAccount(myAccountInformation);
      const _hasPrivilegedAccess =
        myAccountInformation?.role === 'ShippingLineStaff' ||
        myAccountInformation?.role === 'ShippingLineAdmin' ||
        myAccountInformation?.role === 'TravelAgencyStaff' ||
        myAccountInformation?.role === 'TravelAgencyAdmin' ||
        myAccountInformation?.role === 'SuperAdmin';
      setHasPrivilegedAccess(_hasPrivilegedAccess);
    } else {
      invalidateItem('jwt');
      setLoggedInAccount(undefined);
      setHasPrivilegedAccess(false);
    }
  };

  function signIn(email: string, password: string): Promise<string> {
    return signInWithEmailAndPassword(firebase, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success sign in`);
        return user.uid;
      })
      .catch((error) => {
        throw new Error(`sign in error`);
      });
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(firebase, email, {
      url: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://www.admin.ayahay.com',
    })
      .then((res) => {
        // Reset successful.
        console.log(`reset success`);
        return true;
      })
      .catch((error) => {
        throw new Error('reset error');
      });
  }

  const handleLogout = async () => {
    try {
      // Reset voyage feature cookie to false
      setCookie(VOYAGE_FEATURE_COOKIE, 'false', 365);
      
      await signOut(firebase);
      // Sign-out successful.
      for (const accountRelatedCacheKey of accountRelatedCacheKeys) {
        invalidateItem(accountRelatedCacheKey);
      }

      // Clear all user-specific feature settings
      if (loggedInAccount?.id) {
        localStorage.removeItem(`voyage-enabled-${loggedInAccount.id}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    currentUser,
    loggedInAccount,
    hasPrivilegedAccess,
    signIn,
    logout: handleLogout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
