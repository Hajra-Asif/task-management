import {
    auth,
    onAuthStateChanged,
    addDoc,
    updateDoc,
    serverTimestamp,
    collection,
    db,
    getDoc,
    doc,
     query, where, onSnapshot
} from "./firebase.js";

const taskForm = document.getElementById("taskform");

// // =========================== CLOUDINARY CONFIGURATION ========//////////===========
// const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/duo0iqvpr/upload";
//                                   //////////////
// const CLOUDINARY_UPLOAD_PRESET = "minihackathon";

// /////////////////// Function to upload media to Cloudinary ///////////////

// export const uploadToCloudinary = async (file) => {
//     if (!file) return null; 

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//     try {
//         const response = await fetch(CLOUDINARY_UPLOAD_URL, {
//             method: "POST",
//             body: formData,
//         });
//         const data = await response.json();
//         return data.secure_url || null;
//     } catch (error) {
//         console.error("Error uploading to Cloudinary:", error);
//         return null;
//     }
// };

// =========================== Store Authenticated User Globally ===========================
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// =========================== Handle product Form Submission ===========================

taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();


    if (!currentUser) {
        alert("You must be logged in to create or edit a blog!");
        return;
    }

    const titleName = document.getElementById("titleName").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("mainContent").value;
    const currentDate = new Date().toLocaleDateString();
    const dueDate = document.getElementById('dueDate').value;

   


    // **CREATE new tak**

    try {

        const docRef = await addDoc(collection(db, "taskData"), {
            titleName,
            category,
            description,
            currentDate,
            dueDate,
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            taskid: ""
        });

        console.log("Document written with ID: ", docRef.id);
        const documnetRef = doc(db, "taskData", docRef.id);

        await updateDoc(documnetRef, {
             taskid: docRef.id,

        });

        console.log("this is task id" , docRef.id);
        

        console.log("task successfully posted!");

        if (docRef.id) {
            await updateDoc(documnetRef, {
                titleName,
                category,
                description,
            
                currentDate,

                updatedAt: serverTimestamp(),
              });
        
              alert("product updated successfully!");
        } else {
            console.log("error in updating product");
            
        }

    } catch (error) {
        console.log("error in creating post", error);

    }







});
