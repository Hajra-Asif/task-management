import { auth, onAuthStateChanged, doc, setDoc, serverTimestamp, onSnapshot, db } from "./firebase.js";

const cloudinaryUploadUrl = "https://api.cloudinary.com/v1_1/dyrvpyc8f/image/upload";
const cloudinaryUploadPreset = "praticeCloudinary";

document.addEventListener("DOMContentLoaded", () => {
    const profileForm = document.querySelector("form");
    const profilePicInput = document.getElementById("profilePic");
    const imagePreview = document.getElementById("profileImage");

    if (!profileForm) {
        console.error("Profile form not found!");
        return;
    }

    onAuthStateChanged(auth, async (user) => {    
        if (user) {
            const userRef = doc(db, "users", user.uid);

            onSnapshot(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    document.getElementById("email").value = userData?.email ?? user.email;
                    document.getElementById("fullName").value = userData?.name ?? '';
                    document.getElementById("gender").value = userData?.gender ?? '';
                    imagePreview.src = userData?.profile_pic || "../images/profile/one.avif";
                } else {
                    console.log("No user data found, creating new user document.");
                    setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        name: "",
                        gender: "",
                        profile_pic: "",
                        createdAt: serverTimestamp()
                    });
                }
            });
        }
    });

    profilePicInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const gender = document.getElementById("gender").value;
        const file = profilePicInput.files[0];

        const user = auth.currentUser;
        if (!user) {
            alert("Error: No authenticated user found.");
            return;
        }

        let imageUrl = imagePreview.src.includes("base64") ? await uploadImageToCloudinary(file) : imagePreview.src;

        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                name,
                email,
                gender,
                profile_pic: imageUrl,
                updatedAt: serverTimestamp()
            }, { merge: true });

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    });
});

async function uploadImageToCloudinary(file) {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
        const response = await fetch(cloudinaryUploadUrl, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Image upload failed!");
        return "";
    }
}
