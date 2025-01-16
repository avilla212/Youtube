// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup,
    GoogleAuthProvider,
    // Help us detect if a user is signed in or not 
    onAuthStateChanged,
    // User interface type for type checking
    User     
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_-FVKv1X7gnyySZlKPV_n9YUoHYMJAAg",
  authDomain: "yt-clone-3fa2b.firebaseapp.com",
  projectId: "yt-clone-3fa2b",
//   we have our own bucket and messaging
//   storageBucket: "yt-clone-3fa2b.firebasestorage.app",
//   messagingSenderId: "403850602836",
  appId: "1:403850602836:web:df31ea99d9d4f0cbd280c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Getting instance of the auth service
const auth = getAuth(app);

/**
 * Signs user in with google popup
 * @returns A promise that resolve with the users credentials
 */
export function signInWithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Sign out user from the app
 * @returns A promise that resolves when the user is signed out
 */
export function signOut(){
    return auth.signOut();
}

/**
 * Trigger a callback function when the user signs in or out
 * @param callback A function that takes a user as an argument
 */

// aceepts two types, a user or a null and will return void
export function onAuthStateChangedHelper(callback: (user: User | null) => void){
    // Firebase provided function

    // we pass in an instance of auth and a callback function which has to be 
    // of type User or null
    return onAuthStateChanged(auth, callback)
}
