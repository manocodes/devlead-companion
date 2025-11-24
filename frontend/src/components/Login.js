import React from 'react';
import './Login.css';

function Login() {
    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = 'http://localhost:3000/auth/google';
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>DevLead Companion</h1>
                <p>Sign in to continue</p>
                <button className="google-login-btn" onClick={handleGoogleLogin}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

export default Login;
