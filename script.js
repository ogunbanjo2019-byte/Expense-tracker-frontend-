document.addEventListener("DOMContentLoaded", () => {

    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    const forgotBox = document.getElementById('forgot-box');

    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const showForgot = document.getElementById('show-forgot');
    const backLogin = document.getElementById('back-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');

    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');
    const forgotMessage = document.getElementById('forgot-message');

    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app');

    const BASE_URL = "https://expense-tracker-backend-1-afoj.onrender.com/api";

    document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("reset-form");
    const message = document.getElementById("reset-message");

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        message.textContent = "Invalid reset link";
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById("new-password").value;

        try {
            const res = await fetch("https://expense-tracker-backend-1-afoj.onrender.com/api/auth/reset-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                message.textContent = "Password reset successful!";
                message.style.color = "green";
            } else {
                message.textContent = data.message;
                message.style.color = "red";
            }

        } catch {
            message.textContent = "Server error";
        }
    });

});

    // ================= UI SWITCH =================
    function switchView(view) {
        loginBox.style.display = "none";
        signupBox.style.display = "none";
        forgotBox.style.display = "none";
        view.style.display = "block";
    }

    showSignup?.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(signupBox);
    });

    showLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(loginBox);
    });

    showForgot?.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(forgotBox);
    });

    backLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(loginBox);
    });

    function showMessage(element, text, color = "red") {
        element.textContent = text;
        element.style.color = color;
        setTimeout(() => element.textContent = "", 3000);
    }

    // ================= LOGIN =================
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            })
        });

        const data = await res.json();

        if (res.ok) {
            showMessage(loginMessage, "Login successful", "green");
        } else {
            showMessage(loginMessage, data.message);
        }
    });

    // ================= SIGNUP =================
    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: document.getElementById('signup-name').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value
            })
        });

        const data = await res.json();

        if (res.ok) {
            showMessage(signupMessage, "Signup successful", "green");
            switchView(loginBox);
        } else {
            showMessage(signupMessage, data.message);
        }
    });

    // ================= FORGOT PASSWORD =================
    forgotForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("forgot-email").value;

        try {
            const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                showMessage(forgotMessage, "Reset link sent! Check your email.", "green");
            } else {
                showMessage(forgotMessage, data.message);
            }

        } catch {
            showMessage(forgotMessage, "Server error");
        }
    });

});