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
    const logoutBtn = document.getElementById('logout-btn');
    const form = document.getElementById('form');

    const BASE_URL = "https://expense-tracker-backend-1-afoj.onrender.com/api";

    let token = localStorage.getItem('token');
    let inactivityTimer;

    function startInactivityTimer() {
        resetInactivityTimer();

        ["click", "mousemove", "keydown", "scroll"].forEach(event => {
            document.addEventListener(event, resetInactivityTimer);
        });
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);

        inactivityTimer = setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("name");

            alert("Logged out due to inactivity");

            location.reload();
        }, 3000); 
    }

    function showMessage(element, text, color = "red") {
        if (!element) return;
        element.textContent = text;
        element.style.color = color;

        // setTimeout(() => {
        //     element.textContent = "";
        // }, 3000);
    }

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

    function showWelcomeScreen() {
        const name = localStorage.getItem("name") || "User";

        const welcomeScreen = document.getElementById("welcome-screen");
        const welcomeText = document.getElementById("welcome-text");

        if (!welcomeScreen || !welcomeText) return;

        welcomeText.textContent = `Welcome, ${name}`;
        welcomeScreen.style.display = "flex";

        setTimeout(() => {
            welcomeScreen.style.display = "none";
            appContainer.style.display = "block";
            loadExpenses();

            startInactivityTimer();

        }, 2000);
    }

    async function checkAuth() {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            authContainer.style.display = "block";
            appContainer.style.display = "none";
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/auth/verify`, {
                headers: {
                    "Authorization": `Bearer ${storedToken}`
                }
            });

            if (!res.ok) throw new Error();

            token = storedToken;

            authContainer.style.display = "none";
            appContainer.style.display = "none";

            showWelcomeScreen();

        } catch {
            localStorage.removeItem('token');
            authContainer.style.display = "block";
            appContainer.style.display = "none";
        }
    }

    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: document.getElementById('login-email').value,
                    password: document.getElementById('login-password').value
                })
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);

                if (data.user?.name) {
                    localStorage.setItem("name", data.user.name);
                }

                token = data.token;

                authContainer.style.display = "none";
                appContainer.style.display = "none";

                showWelcomeScreen();

            } else {
                showMessage(loginMessage, data.message || "Login failed");
            }

        } catch (err) {
            console.log(err);
            showMessage(loginMessage, "Server error");
        }
    });

    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.getElementById('signup-name').value,
                    email: document.getElementById('signup-email').value,
                    password: document.getElementById('signup-password').value
                })
            });

            const data = await res.json();

            if (res.ok) {
                showMessage(signupMessage, "Signup successful! Now login.", "green");
                switchView(loginBox);
            } else {
                showMessage(signupMessage, data.message || "Signup failed");
            }

        } catch (err) {
            console.log(err);
            showMessage(signupMessage, "Server error");
        }
    });

    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        token = null;
        checkAuth();
    });

    checkAuth();

});