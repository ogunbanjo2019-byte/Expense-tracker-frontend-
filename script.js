document.addEventListener("DOMContentLoaded", () => {

    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    const forgotBox = document.getElementById('forgot-box');
    const logoutBtn = document.getElementById("logout-btn");

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

    const form = document.getElementById('form');
    const list = document.getElementById('list');
    const totalDisplay = document.getElementById('total');

    const BASE_URL = "https://expense-tracker-backend-1-afoj.onrender.com/api";

    let token = localStorage.getItem("token");
    let inactivityTimer;

    // ================= INACTIVITY LOGOUT =================
    function startInactivityTimer() {
        resetTimer();

        ["click", "mousemove", "keydown", "scroll"].forEach(event => {
            document.addEventListener(event, resetTimer);
        });
    }

    function resetTimer() {
        clearTimeout(inactivityTimer);

        inactivityTimer = setTimeout(() => {
            localStorage.removeItem("token");
            alert("Session expired. Please login again.");
            location.reload();
        }, 300000); // 5 minutes
    }

    // ================= SWITCH VIEW =================
    function switchView(view) {
        loginBox.style.display = "none";
        signupBox.style.display = "none";
        forgotBox.style.display = "none";
        view.style.display = "block";
    }

    showSignup?.addEventListener("click", e => {
        e.preventDefault();
        switchView(signupBox);
    });

    showLogin?.addEventListener("click", e => {
        e.preventDefault();
        switchView(loginBox);
    });

    showForgot?.addEventListener("click", e => {
        e.preventDefault();
        switchView(forgotBox);
    });

    backLogin?.addEventListener("click", e => {
        e.preventDefault();
        switchView(loginBox);
    });

    function showMessage(el, text, color = "red") {
        el.textContent = text;
        el.style.color = color;
        setTimeout(() => el.textContent = "", 3000);
    }

    // ================= LOGIN =================
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: document.getElementById("login-email").value,
                    password: document.getElementById("login-password").value
                })
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem("token", data.token);

                authContainer.style.display = "none";
                appContainer.style.display = "block";

                loadExpenses();
                startInactivityTimer(); // ✅ START TIMER

            } else {
                showMessage(loginMessage, data.message);
            }

        } catch {
            showMessage(loginMessage, "Server error");
        }
    });

    // ================= SIGNUP =================
    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BASE_URL}/auth/signup`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: document.getElementById("signup-name").value,
                    email: document.getElementById("signup-email").value,
                    password: document.getElementById("signup-password").value
                })
            });

            const data = await res.json();

            if (res.ok) {
                showMessage(signupMessage, "Signup successful", "green");
                switchView(loginBox);
            } else {
                showMessage(signupMessage, data.message);
            }

        } catch {
            showMessage(signupMessage, "Server error");
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

    // ================= LOAD EXPENSES =================
    async function loadExpenses() {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${BASE_URL}/expenses`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const expenses = await res.json();

            list.innerHTML = "";
            let total = 0;

            if (!expenses.length) {
                list.innerHTML = "<li>No expenses yet</li>";
                totalDisplay.textContent = 0;
                return;
            }

            expenses.forEach(exp => {
                const li = document.createElement("li");

                li.innerHTML = `
                    ${exp.description} - ₦${exp.amount} (${exp.category})
                `;

                list.appendChild(li);
                total += Number(exp.amount);
            });

            totalDisplay.textContent = total;

        } catch (err) {
            console.log("LOAD ERROR:", err);
        }
    }

    // ================= ADD EXPENSE =================
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: document.getElementById("desc").value,
                    amount: document.getElementById("amount").value,
                    category: document.getElementById("category").value
                })
            });

            if (!res.ok) return;

            form.reset();
            loadExpenses();

        } catch (err) {
            console.log("ADD ERROR:", err);
        }
    });
    // ================= LOGOUT =================
logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");

    // Go back to login UI
    authContainer.style.display = "block";
    appContainer.style.display = "none";

    alert("Logged out successfully");
});

    // ================= AUTO LOGIN =================
    if (token) {
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        loadExpenses();
        startInactivityTimer(); // ✅ ALSO START HERE
    }

});