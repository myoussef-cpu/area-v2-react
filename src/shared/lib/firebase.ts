import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA8nNrJm6pD9FY_6nBmBGlVZCRPsNsQEPY',
  authDomain: 'area-ff605.firebaseapp.com',
  projectId: 'area-ff605',
  storageBucket: 'area-ff605.firebasestorage.app',
  messagingSenderId: '367285706849',
  appId: '1:367285706849:web:12345',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
