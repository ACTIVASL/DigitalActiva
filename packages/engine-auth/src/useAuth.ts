import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';


export function useFirebaseAuthState() {
  const [user, setUser] = useState<User | null>(null);
  // const { logActivity } = useActivityLog();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  /* AUTH STATE LISTENER */
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setError(null);

        // Premium status from Firestore profile or Custom Claims
        unsubscribeProfile = onSnapshot(
          doc(db, 'users', currentUser.uid),
          (docSnapshot) => {
            const data = docSnapshot.data();
            // Check for 'premium' status (case insensitive)
            const status = data?.subscriptionStatus?.toLowerCase();
            setIsPremium(status === 'premium' || status === 'lifetime');
            setLoading(false);
          },
          (_err) => {
            setIsPremium(false); // Default to free on error
            setLoading(false);
          },
        );
      } else {
        // Logged out
        setIsPremium(false);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message || 'Error al iniciar sesión');
      setLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCred.user);
      // Note: User document creation should be handled here or via trigger if not existing
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message || 'Error al registrar usuario');
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('demo_patients'); // TITANIUM: Clear Demo Data on Exit
    await firebaseSignOut(auth);
  };

  /* GOOGLE AUTH WITH POPUP (STATIC IMPORT - INSTANT) */
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      // FORCE PERSISTENCE: local (survives browser close)
      await setPersistence(auth, browserLocalPersistence);

      const provider = new GoogleAuthProvider();
      // FORCE ACCOUNT SELECTION (Prevents "Stuck" login)
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      // CLASSIC POPUP (Bypasses Redirect Restrictions)
      await signInWithPopup(auth, provider);
      return true;

      // logActivity('security', 'Inicio de sesión con Google exitoso');
    } catch (err: unknown) {
      let message = 'Error al iniciar sesión con Google';
      if (err instanceof Error) {
        message = err.message;

        // Titanium Standard: Type Guard for Firebase Error Code
        const firebaseErr = err as { code?: string };

        if (firebaseErr.code === 'auth/popup-closed-by-user') {
          message = 'Inicio de sesión cancelado por el usuario';
        } else if (firebaseErr.code === 'auth/domain-not-authorized') {
          message = 'Dominio no autorizado. Contacte soporte.';
        } else if (firebaseErr.code === 'auth/popup-blocked') {
          message = 'El navegador bloqueó la ventana emergente. Permita popups para este sitio.';
        } else if (firebaseErr.code === 'auth/cancelled-popup-request') {
          message = 'Solo se permite una solicitud emergente a la vez.';
        }
      }
      setError(message);
      setLoading(false);
      return false;
    }
  };


  return {
    user,
    loading,
    error,
    isPremium,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
