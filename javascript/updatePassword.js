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
        Swal.fire({
            icon: 'warning',
            title: 'Password Mismatch',
            text: 'New passwords do not match.',
          });
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        Swal.fire({
            icon: 'warning',
            title: 'User not found',
            text: 'Please make sure you are login',
          });
        return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Swal.fire({
            icon: "success",
            title: "Password Updated",
            text: "Your password has been updated.",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          })
        
    } catch (error) {
        Swal.fire({
            icon: 'warning',
            title: 'Error in updating password',
            text: 'Please try again after a while',
          });
    }
};

document.getElementById('updatePasswordBtn')?.addEventListener('click', updateUserPassword);
