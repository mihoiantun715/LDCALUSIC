// Check if user is logged in and update UI accordingly
import { checkAuthState } from './firebase-auth.js';

// Check authentication state on page load
checkAuthState((user) => {
    const authDropdown = document.querySelector('.auth-dropdown');
    
    if (user && authDropdown) {
        // User is logged in - show dashboard link instead of login/register
        authDropdown.innerHTML = `
            <button class="auth-btn">
                <i class="fas fa-user-circle"></i>
                <span>Račun</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
                <a href="dashboard.html" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="javascript:void(0)" class="dropdown-item" id="logoutBtnHome">
                    <i class="fas fa-sign-out-alt"></i> Odjava
                </a>
            </div>
        `;
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtnHome');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const { logoutUser } = await import('./firebase-auth.js');
                const result = await logoutUser();
                if (result.success) {
                    window.location.reload();
                }
            });
        }
    }
});
