import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB5cFbRoxBkqU1gSvfF8mU3s9ESyeevdus',
  authDomain: 'area-ff605.firebaseapp.com',
  projectId: 'area-ff605',
  storageBucket: 'area-ff605.firebasestorage.app',
  messagingSenderId: '223639059243',
  appId: '1:223639059243:web:4f45317a203ebc6235a36e',
  measurementId: 'G-3VJXXM51JF',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn('فشل اتصال Firebase. ستعمل الميزات بدون سحابة.', e);
}

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile };
export const googleProvider = app ? new GoogleAuthProvider() : null;
export const firebaseAvailable = !!app;
