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

    const list = document.getElementById('list');
    const totalDisplay = document.getElementById('total');

    const BASE_URL = "https://expense-tracker-backend-1-afoj.onrender.com/api";

    let token = localStorage.getItem('token');
    let inactivityTimer;
    let listenersAdded = false;

    // 🔍 DEBUG
    console.log("Elements:", showForgot, forgotBox);

    // ================= INACTIVITY TIMER =================
    function startInactivityTimer() {
        resetInactivityTimer();

        if (!listenersAdded) {
            ["click", "mousemove", "keydown", "scroll"].forEach(event => {
                document.addEventListener(event, resetInactivityTimer);
            });
            listenersAdded = true;
        }
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);

        inactivityTimer = setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            alert("Logged out due to inactivity");
            location.reload();
        }, 300000);
    }

    // ================= UI HELPERS =================
    function showMessage(element, text, color = "red") {
        if (!element) return;
        element.textContent = text;
        element.style.color = color;

        setTimeout(() => element.textContent = "", 3000);
    }

    function switchView(view) {
        loginBox.style.display = "none";
        signupBox.style.display = "none";
        forgotBox.style.display = "none";

        if (view) view.style.display = "block";
    }

    // ================= NAVIGATION =================
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
        console.log("Forgot clicked");

        loginBox.style.display = "none";
        signupBox.style.display = "none";
        forgotBox.style.display = "block";
    });

    backLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        switchView(loginBox);
    });

    // ================= WELCOME =================
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

    // ================= AUTH CHECK =================
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
            showWelcomeScreen();

        } catch {
            localStorage.removeItem('token');
            authContainer.style.display = "block";
            appContainer.style.display = "none";
        }
    }

    // ================= LOGIN =================
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
                localStorage.setItem("name", data.user?.name || "User");

                token = data.token;
                authContainer.style.display = "none";

                showWelcomeScreen();

            } else {
                showMessage(loginMessage, data.message || "Login failed");
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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            console.log("Response:", data);

            if (res.ok) {
                showMessage(forgotMessage, data.message, "green");
            } else {
                showMessage(forgotMessage, data.message || "Error sending email");
            }

        } catch (err) {
            console.log(err);
            showMessage(forgotMessage, "Server error");
        }
    });

    // ================= LOAD EXPENSES =================
    async function loadExpenses() {
        try {
            const res = await fetch(`${BASE_URL}/expenses`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error();

            const expenses = await res.json();

            list.innerHTML = "";
            let total = 0;

            expenses.forEach(exp => {
                const li = document.createElement("li");

                li.innerHTML = `
                    <span>${exp.description} - ₦${exp.amount} (${exp.category})</span>
                    <button class="delete-btn" data-id="${exp._id}">Delete</button>
                `;

                list.appendChild(li);
                total += Number(exp.amount);
            });

            totalDisplay.textContent = total;

            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", deleteExpense);
            });

        } catch (err) {
            console.log("Load error:", err);
        }
    }

    // ================= ADD EXPENSE =================
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: document.getElementById('desc').value,
                    amount: document.getElementById('amount').value,
                    category: document.getElementById('category').value
                })
            });

            if (!res.ok) throw new Error();

            form.reset();
            loadExpenses();

        } catch (err) {
            console.log("Add error:", err);
        }
    });

    // ================= DELETE =================
    async function deleteExpense(e) {
        const id = e.target.dataset.id;

        if (!confirm("Delete this expense?")) return;

        try {
            const res = await fetch(`${BASE_URL}/expenses/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                console.log("Delete failed:", res.status);
                return;
            }

            loadExpenses();

        } catch (err) {
            console.log("Delete error:", err);
        }
    }

    // ================= LOGOUT =================
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        location.reload();
    });

    // ================= INIT =================
    checkAuth();

});