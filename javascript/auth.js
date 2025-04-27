import { auth, signOut , onAuthStateChanged } from './firebase.js';


document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector("#logoutBtn");

    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is logged in:", user);
            localStorage.setItem("userLoggedIn", "true");
        } else {
            console.log("User is logged out");
            localStorage.removeItem("userLoggedIn"); 
            window.location.href = "../pages/index.html";
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                console.log("User signed out");
                localStorage.removeItem("userLoggedIn"); 
                window.location.href = "../index.html"; 
            } catch (error) {
                console.error("Logout error:", error.message);
            }
        });
    }
});
