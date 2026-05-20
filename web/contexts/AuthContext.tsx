import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { firebase } from '@/app/utils/initFirebase';
import { useIdToken } from 'react-firebase-hooks/auth';
import { cacheItem, invalidateItem } from '@ayahay/services/cache.service';
import { accountRelatedCacheKeys } from '@ayahay/constants';
import { IAccount, RegisterForm } from '@ayahay/models';
import { mapPassengerToDto } from '@/services/passenger.service';
import {
  getAccountInformation,
  createPassengerAccount,
} from '@ayahay/services/account.service';

const AuthContext = createContext({
  currentUser: null as User | undefined | null,
  // loggedInAccount is null if it's loading
  loggedInAccount: null as IAccount | undefined | null,
  hasPrivilegedAccess: false,
  loading: true,
  register: (email: string, password: string, values: RegisterForm) => Promise,
  signIn: (email: string, password: string) => Promise,
  signInWithGoogle: () => Promise,
  signInWithFacebook: () => Promise,
  logout: () => Promise,
  resetPassword: (email: string) => Promise,
  sendEmailVerification: (user: User) => Promise,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider({ children }: any) {
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

  function register(email: string, password: string, values: RegisterForm) {
    return createUserWithEmailAndPassword(firebase, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(`success register`);

        const token = await user.getIdToken();

        const mappedPassenger = mapPassengerToDto(values);
        await createPassengerAccount(token, mappedPassenger);

        sendEmailVerification(user);
        return token;
      })
      .catch((error) => {
        const errorCode = error.code;
        throw new Error(errorCode);
      });
  }

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

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(firebase, provider);
  }

  function signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    return signInWithRedirect(firebase, provider);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(firebase, email, {
      url: process.env.NEXT_PUBLIC_WEB_URL ?? 'https://www.ayahay.com',
    })
      .then((res) => {
        // Reset successful.
        console.log(`reset success`);
        return true;
      })
      .catch((error) => {
        throw new Error(`reset error`);
      });
  }

  function logout() {
    return signOut(firebase)
      .then(() => {
        // Sign-out successful.
        for (const accountRelatedCacheKey of accountRelatedCacheKeys) {
          invalidateItem(accountRelatedCacheKey);
        }
      })
      .catch((error) => {
        throw new Error('sign out error');
      });
  }

  const value = {
    currentUser,
    loggedInAccount,
    hasPrivilegedAccess,
    loading,
    register,
    signIn,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    sendEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
