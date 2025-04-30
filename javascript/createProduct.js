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


// =========================== Store Authenticated User Globally ===========================
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// =========================== Handle task Form Submission ===========================

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




    // **CREATE new task**

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

        Swal.fire({
            icon: "success",
            title: "Task Uploaded",
            text: "Your task has been uploaded.",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          })
          .then((result) => {
    
            if (result.dismiss === Swal.DismissReason.timer) {
              window.location.href = "../pages/dashboard.html";
            }
          });
        if (docRef.id) {
            await updateDoc(documnetRef, {
                titleName,
                category,
                description,

                currentDate,

                updatedAt: serverTimestamp(),
            });

        } else {
            console.log("error in updating product");

        }

    } catch (error) {
        console.log("error in creating post", error);

    }







});
