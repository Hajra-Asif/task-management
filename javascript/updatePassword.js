import { auth ,updatePassword, reauthenticateWithCredential, EmailAuthProvider} from "./firebase.js";


// ===========================================================  updatePassword
const updateUserPassword = async () => {
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
        console.error("Password input fields not found on this page.");
        return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert('User not authenticated!');
        return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert('Password updated successfully!');
    } catch (error) {
        alert('Error updating password: ' + error.message);
    }
};

document.getElementById('updatePasswordBtn')?.addEventListener('click', updateUserPassword);
