// start -- imports 

import { auth, signInWithEmailAndPassword, GoogleAuthProvider,signOut,signInWithPopup, } from "./firebase.js"

// close -- imports 

// start -- action functions

// logiin User

const loginUser = async (e) => {

    e.preventDefault()
    
   
    // getinputvalues
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  


    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User registered successfully:", user);

        if (user) {

            window.location.replace("../pages/dashboard.html")
            console.log("user is logged in" , user);
            

        }
        else {
            console.log("user not found");

        }

    } catch (error) {
        console.log("error in logging", error);

    }



}

/////  GoogleAuthProvider

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let google = async () => {
  try {
    await signOut(auth); //  Pehle Logout
    console.log("User signed out before sign-in attempt.");

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
  } catch (error) {
   console.log(error);
   
  }
};
// close -- action functions


// eventlisteners
document.getElementById("google")?.addEventListener("click", google);
document.getElementById("loginform")?.addEventListener("submit", loginUser);