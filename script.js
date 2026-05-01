document.addEventListener("DOMContentLoaded", () => {

    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');

    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app');

    const logoutBtn = document.getElementById('logout-btn');

    const BASE_URL = "https://my-expenses-tracker-9uhz.onrender.com/api";

    let token = localStorage.getItem('token');

    showSignup.onclick = (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        signupBox.style.display = 'block';
    };

    showLogin.onclick = (e) => {
        e.preventDefault();
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
    };

    function checkAuth() {
        if (token) {
            authContainer.style.display = "none";
            appContainer.style.display = "block";
        } else {
            authContainer.style.display = "block";
            appContainer.style.display = "none";
        }
    }

    loginForm.onsubmit = async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            checkAuth();
        } else {
            alert(data.message);
        }
    };

    signupForm.onsubmit = async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful! Login now.");
            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        } else {
            alert(data.message);
        }
    };

    logoutBtn.onclick = () => {
        localStorage.removeItem('token');
        token = null;
        checkAuth();
    };

    checkAuth();
});