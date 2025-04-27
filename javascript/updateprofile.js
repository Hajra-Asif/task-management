import { auth, onAuthStateChanged, getDoc, doc, updateDoc, db, collection, query, where, onSnapshot } from "./firebase.js"

var uid;
let userState;



// let updateStudentInfo = async (uid) =>{

//     const userDocRef = doc(db, "users", uid);
//     await updateDoc(userDocRef, {
//         docid: docRef.id
//     });

//     console.log(docRef);
// }










// let userData;
// let getUserData = async (uid) => {


//     try {
//         const docRef = collection(db, "users");


//         const q = query(docRef, where("uid", "==", uid));
//         onSnapshot(q, (snapshot) => {

//             userData = snapshot.docs[0].data();
//             console.log(userData, "inside ")
//             return userData;

//         });


//     }
//     catch (e) {
//         console.log("error in getting data", e);

//     }
// }



// let userState;
// userstate = getUserData;
//  make a function to call current user data
//  is func me userdata = 




// Update existing document

async function updateStudentInfo(userId) {

console.log("user id from auth", userId);


    console.log(uid, "uid") 
    console.log(userState, "user data")




    const updatedData = {
        name: document.getElementById("name").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        rollNo: document.getElementById("rollNo").value,
        year: document.getElementById("year").value,
        religion: document.getElementById("religion").value,
        bloodGroup: document.getElementById("bloodGroup").value
    };

    try {

        const docRef = doc(db, "users", userId); 
        await updateDoc(docRef, updatedData);
        alert("Profile updated successfully!");
        console.log("updated doc", updatedData);



    } catch (error) {
        console.error("Error updating profile:", error);
    }
}

// //  get student academic info

// async function loadStudentInfo(uid) {
//     const docRef = doc(db, "users", uid);

//     try {
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//             const data = docSnap.data();
//             document.getElementById("name").value = data.name;
//             document.getElementById("username").value = data.username;
//             document.getElementById("email").value = data.email;
//             document.getElementById("rollNo").value = data.rollNo;
//             document.getElementById("year").value = data.year;
//             document.getElementById("religion").value = data.religion;
//             document.getElementById("bloodGroup").value = data.bloodGroup;
//         }
//         else {
//             console.log("No such document!");
//         }
//     }
//     catch (error) {
//         console.log("Error getting document:", error);
//     }
// }

onAuthStateChanged(auth, async (user) => {

    if (user) {
        try {

            uid = localStorage.getItem("uid");
            console.log(uid, "here is the uid");

            //calling updated func
            document.getElementById("savechanges")?.addEventListener("submit", (e) => {
                e.preventDefault()
                updateStudentInfo(uid)
            }); 

            // userState = await getUserData(user.uid);
            // await loadStudentInfo(user.uid);
            // console.log("all loaded!")
        }
        catch (e) {
            console.log(e)
        }

    } else {
        uid = null;
    }
})

// eventlisteners

