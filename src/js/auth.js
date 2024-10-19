import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { config } from "../App";

import {
    getIdToken,
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCEQCCf9iqzQ4g2fcHNGkAxtaVwwTgwplE",
    authDomain: "scanner-efb21.firebaseapp.com",
    projectId: "scanner-efb21",
    storageBucket: "scanner-efb21.appspot.com",
    messagingSenderId: "68661105691",
    appId: "1:68661105691:web:0acdb5acaed633a5c4d4be",
    measurementId: "G-RVV2RVF0NV",
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user);
            console.log(token);
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}

async function genJwtCode() {
    const auth = getAuth();
    const user = auth.currentUser;
    const idToken = await getIdToken(user, true);
    console.log(idToken);
    console.log(config);
}

export { signInWithGoogle, genJwtCode };
