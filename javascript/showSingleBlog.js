import { db, doc, getDoc, onAuthStateChanged, auth, addDoc, collection, serverTimestamp, query, orderBy, getDocs ,deleteDoc , where , setDoc } from "./firebase.js";

const signInIcon = document.getElementById("signInIcon");
const userProfile = document.getElementById("userProfile");
const profileImage = document.getElementById("profileImage");
let loggedInUserId = null;


// ============================================================== authentic user

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        loggedInUserId = user.uid;
        

        // Firestore se user ka document fetch karna
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("User data from Firestore:", userData);

            signInIcon.classList.add("d-none"); // Sign-in icon hide karein
            userProfile.classList.remove("d-none"); // Profile image show karein

            // Firestore se profile image set karein
            if (userData.profile_pic) {
                profileImage.src = userData.profile_pic;
            } else {
                profileImage.src = "../images/profile/2.jpeg"; // Default image
            }
        } else {
            console.log("User document not found in Firestore.");
        }
    } else {
        console.log("User is logged out.");
        signInIcon.classList.remove("d-none");
        userProfile.classList.add("d-none");
    }
});

// ============================================================== get id from card and display the blog

// Get blog ID from URL
const urlParams = new URLSearchParams(window.location.search);
const blogId = urlParams.get("id");
console.log("Blog ID from URL:", blogId);
const blogDetailsContainer = document.getElementById("blogDetailsContainer");

const fetchBlogDetails = async () => {
    try {
        if (!blogId) {
            throw new Error("Invalid blog ID.");
        }

        const blogRef = doc(db, "blogs", blogId);
        const docSnap = await getDoc(blogRef);

        if (!docSnap.exists()) {
            throw new Error("Blog not found.");
        }

        const blog = docSnap.data();
        // console.log("Fetched Blog Data:", blog); 


        if (!blog.date) {
            console.warn(" Date is missing in Firestore document!");
        }
        
        // console.log("Blog Data:", blog);  // Check full blog data
        // console.log("Blog Date:", blog.date);  // Check if date exists

        if (blog.authorId) {
            const userDocRef = doc(db, "users", blog.authorId);
            const userDocSnap = await getDoc(userDocRef);
        
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                console.log("Author Data:", userData); // Debugging ke liye
                document.getElementById("blogAuthor").innerText = userData.name || "Unknown Author";
                console.log("Author Name Element:", document.getElementById("blogAuthor"));

            } else {
                console.log("User document not found.");
            }
        } else {
            console.log("Author ID not found in the blog document.");
        }
        

        // Blog Header (Title + Image)
        let blogHTML = `
        
        <div class="container blog-container" >
            <div class="text-center">
                <h1 id="blogTitle">${blog.title}</h1>
                <img id="blogImage" src="${blog.titleImage || '../images/default-blog.jpg'}" class="img-fluid shadow mt-3 w-100 rounded" alt="Blog Image">
                <div class="container mt-4">
                    <div class="card shadow-sm border-0 rounded-4 p-4" style="background-color: var(--white-color);">
                        <div class="card-header text-center py-3" style="background: linear-gradient(135deg, var(--btn1-bg-color), var(--navbar1)); color: var(--white-color); border-radius: 10px;">
                            <h4 class="mb-0"><i class="fas fa-blog"></i> Blog Details</h4>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex align-items-center">
                                <i class="fas fa-tags me-2" style="color: var(--btn1-bg-color);"></i>
                                <strong class="me-2">Category:</strong> 
                                <span id="blogCategory" style="color: var(--paragraph-color); font-weight: 500;">${blog.category}</span>
                                </li>
                                <li class="list-group-item d-flex align-items-center">
                                <i class="fas fa-calendar-alt me-2" style="color: var(--btn1-bg-color);"></i>
                                <strong class="me-2">Date:</strong>
                                <span id="blogDate" style="color: var(--paragraph-color); font-weight: 500;"> ${blog.date || "Unknown Date"}</span>
                                </li>
                                <li class="list-group-item d-flex align-items-center">
                                <i class="fas fa-user me-2" style="color: var(--btn1-bg-color);"></i>
                                <strong class="me-2">Author:</strong> <span id="blogAuthor" style="color: var(--paragraph-color); font-weight: 500;">${blog.author || "Unknown Author"}</span>
                                </li>
                            </ul>

                            <!--  Action Buttons -->
                            <div class="text-center mt-4">
                                <!-- Share Button -->
                                <button id="shareBtn" class="btn btn-outline-secondary"> <i class="ti ti-share"></i> Share </button>
                                    <!-- Share Modal -->
                                    <div id="shareModal" class="modal">
                                        <div class="modal-content">
                                            <span class="close">&times;</span>
                                            <h2>Share with your friends</h2>
                                            <p>Share this blog via:</p>
                                            <!-- Social Media Icons -->
                                                <div class="social-icons">
                                                    <a href="#" id="facebookShare"><i class="fab fa-facebook"></i></a>
                                                    <a href="#" id="twitterShare"><i class="fab fa-twitter"></i></a>
                                                    <a href="#" id="whatsappShare"><i class="fab fa-whatsapp"></i></a>
                                                    <a href="#" id="telegramShare"><i class="fab fa-telegram"></i></a>
                                                </div>
                                            <!-- Copy Link Section -->
                                            <input type="text" id="shareLink" readonly>
                                            <button id="copyBtn">Copy Link</button>
                                        </div>
                                    </div>
                                
                                <button class="btn btn-outline-danger bookmark-btn" id="bookmark-btn" data-blogId="${blogId}" onclick="toggleBookmark(this)"><i class="ti ti-bookmark"></i>Bookmark</button>
                                <button class="btn btn-outline-primary mx-2" onclick="printBlog()"><i class="ti ti-printer"></i> Print</button>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="mainContent">${blog.mainContent}</p>
            </div>
        </div>                    
        `;

        //  Sub-sections Dynamically Fetch karna
        if (blog.sections && blog.sections.length > 0) {
            blog.sections.forEach((section) => {
                blogHTML += `
                        <div class="subSection mt-5">
                            ${section.heading ? `<h3 class="text-start">${section.heading}</h3>` : ""}
                            ${section.subheading ? `<h4 class="text-muted">${section.subheading}</h4>` : ""}
                            ${section.media && section.media.length > 0 ? section.media.map((mediaUrl) => `<img src="${mediaUrl}" class="img-fluid subContentImg rounded">`).join("") : ""}
                            ${section.content ? `<p class="subContent">${section.content}</p>` : ""}
                        </div>
                    `;
            });
        }

         // Comments Section Below Subsections
        blogHTML += `
        <div class="card m-5">
            <div class="card-body">
                <h4>Comments</h4>
                <div id="comment-list">
                    <div class="comment my-3">
                        <strong>John Doe</strong> - This recipe looks amazing! ⭐⭐⭐⭐⭐
                    </div>
                </div>
                <hr>
                <div id="comment-list"></div>
                <hr>
                <input type="text" id="comment-name" class="form-control mb-2" placeholder="Your Name">
                <textarea id="comment-text" class="form-control mb-2" placeholder="Write a comment..."></textarea>
                <label for="comment-rating"><strong>Give Rating:</strong></label>
                <select id="comment-rating" class="form-control mt-2">
                    <option value="">Select Rating</option>
                        <option value="1">1 Star ⭐</option>
                        <option value="2">2 Stars ⭐⭐</option>
                        <option value="3">3 Stars ⭐⭐⭐</option>
                        <option value="4">4 Stars ⭐⭐⭐⭐</option>
                        <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                </select>
                    <button class="btn1 mt-4" onclick="addComment()">Post Comment</button>
            </div>
        </div>
    `;

        blogDetailsContainer.innerHTML = blogHTML;
        loadComments(blogId); // Load comments for this blog
    } catch (error) {
        console.error("Error fetching blog:", error);
        blogDetailsContainer.innerHTML = `<p class='text-center text-danger'>${error.message}</p>`;
    }
};

// ====================================================================================  Add comments

window.addComment = async function () {
    const commentText = document.getElementById("comment-text").value;
    const commentName = document.getElementById("comment-name").value;
    const commentRating = document.getElementById("comment-rating").value;

    if (!blogId) {
        console.error("Blog ID is missing.");
        return;
    }

    if (commentText.trim() === "" || commentName.trim() === "" || commentRating === "") {
        alert("Please enter your name, comment, and rating.");
        return;
    }

    try {
        const commentsRef = collection(db, "blogs", blogId, "comments");  
        await addDoc(commentsRef, {
            name: commentName,
            text: commentText,
            rating: parseInt(commentRating),  
            timestamp: serverTimestamp()
        });

        alert("Comment added successfully!");
        document.getElementById("comment-text").value = ""; 
        document.getElementById("comment-name").value = "";
        document.getElementById("comment-rating").value = "";

        loadComments(blogId); // Reload comments
    } catch (error) {
        console.error("Error adding comment: ", error);
    }
};

async function loadComments(blogId) {
    try {
        const commentsRef = collection(db, "blogs", blogId, "comments");
        const q = query(commentsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const commentList = document.getElementById("comment-list");
        commentList.innerHTML = ""; // Clear previous comments

        querySnapshot.forEach((doc) => {
            const comment = doc.data();
            const commentItem = document.createElement("div");
            commentItem.classList.add("comment", "my-3");
            commentItem.innerHTML = `
                <strong>${comment.name}</strong> - ${comment.text} 
                <span>⭐ ${comment.rating || "No Rating"}</span>
            `;
            commentList.appendChild(commentItem);
        });

    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// ====================================================================================== Share blog

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
    // Use MutationObserver to detect when the modal is added to the DOM
    const observer = new MutationObserver(() => {
        const shareBtn = document.getElementById("shareBtn");
        const shareModal = document.getElementById("shareModal");
        const shareLink = document.getElementById("shareLink");
        const copyBtn = document.getElementById("copyBtn");
        const closeModal = document.querySelector(".close");

        // Ensure elements exist before adding event listeners
        if (!shareBtn || !shareModal || !shareLink || !copyBtn || !closeModal) {
            console.warn(" Waiting for share elements to load...");
            return;
        }

        console.log(" All share elements found. Initializing share functionality...");

        // Hide modal by default (Fixes auto-open issue)
        shareModal.style.display = "none";

        // Get current page URL
        const currentURL = window.location.href;

        // Show modal and set link when share button is clicked
        shareBtn.addEventListener("click", function () {
            shareModal.style.display = "block";
            shareLink.value = currentURL;
        });

        // Copy link functionality
        copyBtn.addEventListener("click", function () {
            navigator.clipboard.writeText(shareLink.value).then(() => {
                alert(" Link copied to clipboard!");
            }).catch(err => {
                console.error(" Failed to copy: ", err);
            });
        });

        // Social Media Share Buttons
        const socialPlatforms = {
            facebookShare: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`,
            twitterShare: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}`,
            whatsappShare: `https://wa.me/?text=${encodeURIComponent(currentURL)}`,
            telegramShare: `https://t.me/share/url?url=${encodeURIComponent(currentURL)}`
        };

        Object.keys(socialPlatforms).forEach((id) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener("click", () => window.open(socialPlatforms[id], "_blank"));
            } else {
                console.warn(`Element with ID '${id}' not found!`);
            }
        });

        // Close modal functionality
        closeModal.addEventListener("click", function () {
            shareModal.style.display = "none";
        });

        window.addEventListener("click", function (event) {
            if (event.target === shareModal) {
                shareModal.style.display = "none";
            }
        });

        console.log(" Share functionality initialized.");
        observer.disconnect(); // Stop observing once initialized
    });

    observer.observe(document.body, { childList: true, subtree: true });
});


//  ======================================================================================= Bookmark
window.toggleBookmark = async (element) => {
    const blogId = element.getAttribute("data-blogId");

    if (!loggedInUserId || !blogId) {
        console.error(" Invalid data for Firestore query");
        alert("If you want to add bookmark to this blog. please login!");
        return;
    }

    const bookmarkRef = collection(db, "FavBlogs");
    const q = query(bookmarkRef, where("user_id", "==", loggedInUserId), where("blog_id", "==", blogId));

    try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            //  Agar blog already bookmarked hai toh usko delete kar do
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            element.innerHTML = '<i class="fa-regular fa-bookmark"></i> Bookmark';
            alert("Blog removed from bookmarks!");
        } else {
            //  Agar blog already Firestore mein nahi hai toh sirf ek baar add karo
            await setDoc(doc(bookmarkRef, `${loggedInUserId}_${blogId}`), {
                user_id: loggedInUserId,
                blog_id: blogId,
                created_at: new Date(),
            });

            element.innerHTML = '<i class="fa-solid fa-bookmark"></i> Bookmarked';
            alert("Blog bookmarked successfully!");
        }
    } catch (error) {
        console.error(" Firestore Query Error:", error);
    }
};

// =============================================================================== Check Bookmark Status on Page Load**
const checkBookmarkStatus = async (blogId) => {
    const bookmarkRef = collection(db, "FavBlogs");
    const q = query(bookmarkRef, where("user_id", "==", loggedInUserId), where("blog_id", "==", blogId));
    const querySnapshot = await getDocs(q);

    const bookmarkBtn = document.getElementById("bookmark-btn");
    if (!querySnapshot.empty) {
        bookmarkBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Bookmarked';
    } else {
        bookmarkBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i> Bookmark';
    }
};


// window.onload = function () {
//     setTimeout(() => {  // Small delay to ensure DOM loads
//         const bookmarkBtn = document.getElementById("bookmark-btn");
//         console.log(`bookmarkBtn`,bookmarkBtn );

//         if (bookmarkBtn) {
//             bookmarkBtn.addEventListener("click", function () {
//                 toggleBookmark(this);
//             });
//         } else {
//             console.error("Bookmark button not found! Ensure the button exists in your HTML.");
//         }
//     }, 500); // Delay of 500ms
// };

// setTimeout(() => {
//     const bookmarkBtn = document.getElementById("bookmark-btn");
//     if (bookmarkBtn) {
//         console.log(" Bookmark button found!");
//         checkBookmarkStatus(bookmarkBtn.getAttribute("data-blogId"));
//     } else {
//         console.error(" Bookmark button still not found! Check if it's inside the correct container.");
//     }
// }, 1000); // Delay by 1 second


function waitForBookmarkButton() {
    let checkInterval = setInterval(() => {
        const bookmarkBtn = document.getElementById("bookmark-btn");
        if (bookmarkBtn) {
            console.log(" Bookmark button found!");
            clearInterval(checkInterval); // Jab mil jaye toh check stop karo

            // Check karo pehle se event attached toh nahi
            bookmarkBtn.replaceWith(bookmarkBtn.cloneNode(true));
            const newBookmarkBtn = document.getElementById("bookmark-btn");

            newBookmarkBtn.addEventListener("click", function () {
                toggleBookmark(this);
            }, { once: true });  // Yeh ensure karega ke sirf ek dafa chale

            const blogId = newBookmarkBtn.getAttribute("data-blogId");
            if (blogId) {
                checkBookmarkStatus(blogId);
            } else {
                console.error(" Blog ID not found on bookmark button!");
            }
        }
    }, 1000); // Har 500ms check karega
}

document.addEventListener("DOMContentLoaded", waitForBookmarkButton);


document.addEventListener("DOMContentLoaded", function () {
    checkBookmarkStatus(blogId);
});

fetchBlogDetails().then(() => {
    loadComments(blogId);
});