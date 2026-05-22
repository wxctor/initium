import { auth, db } from './firebase';
import { createUserWithEmailAndPassword,
         signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function register(email, password, name, role) {
  const cred = await createUserWithEmailAndPassword(
    auth, email, password
  );
  await setDoc(doc(db, 'users', cred.user.uid), {
    name, role, email, createdAt: Date.now()
  });
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(
    auth, email, password
  );
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  return { uid: cred.user.uid, ...snap.data() };
}
