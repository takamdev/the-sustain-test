import { initializeApp} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyC8Q05LY639qvZ2lpE2JmiCufw75KqkcdM",
  authDomain: "the-sustain-test.firebaseapp.com",
  projectId: "the-sustain-test",
  storageBucket: "the-sustain-test.appspot.com",
  messagingSenderId: "858959173268",
  appId: "1:858959173268:web:f9fdcf0eae38e36b208681",
  measurementId: "G-5N21D1JJYR"
};


const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);