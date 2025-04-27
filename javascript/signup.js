// start -- imports 

import { auth, createUserWithEmailAndPassword, GoogleAuthProvider,signOut,signInWithPopup, db, collection, addDoc, doc, updateDoc } from "./firebase.js"

// close -- imports 

// start -- action functions

// Register User
let user;
const registerUser = async (e) => {
    e.preventDefault()

    // getinputvalues
    const fullName = document.getElementById("fullname").value;
    const userName = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    try {


        let userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User registered successfully:", user);


        if (user) {
            localStorage.setItem('email', user?.email);
            localStorage.setItem('uid', user?.uid);
            console.log(user.email);



            try {
                const docRef = await addDoc(collection(db, "users"), {
                    fullName,
                    userName,
                    email,
                    uid: user?.uid,
                    docid: "",
                }, { merge: true });

                console.log("Document written with ID: ", docRef.id);
                const userDocRef = doc(db, "users", docRef.id);
                await updateDoc(userDocRef, {
                    docid: docRef.id
                });

                console.log(docRef);
                location.replace("../pages/login.html");

            } catch (e) {
                console.error("Error adding document: ", e);
            }

        } else {
            console.log("error in login");

        }
        return user;

    } catch (error) {
        console.log(error);

    }


}

// GoogleAuthProvider

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
document.getElementById("signupform")?.addEventListener("submit", registerUser);