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

    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app');

    const logoutBtn = document.getElementById('logout-btn');
    const form = document.getElementById('form');
    const message = document.getElementById('message');

    const BASE_URL = "https://expense-tracker-backend-1-afoj.onrender.com/api";

    let token = localStorage.getItem('token');

    // ================= SWITCH SCREENS =================
    showSignup && (showSignup.onclick = (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        signupBox.style.display = 'block';
    });

    showLogin && (showLogin.onclick = (e) => {
        e.preventDefault();
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    showForgot && (showForgot.onclick = (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        forgotBox.style.display = 'block';
    });

    backLogin && (backLogin.onclick = (e) => {
        e.preventDefault();
        forgotBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    // ================= AUTH CHECK =================
    async function checkAuth() {
    const storedToken = localStorage.getItem('token');

    // ❌ If no token → DO NOTHING
    if (!storedToken) {
        authContainer.style.display = "block";
        appContainer.style.display = "none";
        return;
    }

    // ✅ Only verify AFTER login exists
    try {
        const res = await fetch(`${BASE_URL}/expenses`, {
            headers: {
                "Authorization": `Bearer ${storedToken}`
            }
        });

        if (!res.ok) throw new Error();

        token = storedToken;

        authContainer.style.display = "none";
        appContainer.style.display = "block";

        loadExpenses();

    } catch {
        localStorage.removeItem('token');
        token = null;

        authContainer.style.display = "block";
        appContainer.style.display = "none";
    }
}

    // ================= LOGIN =================
    loginForm && (loginForm.onsubmit = async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                token = data.token;
                checkAuth();
            } else {
                alert(data.message || "Invalid login");
            }

        } catch {
            alert("Server is waking up... try again");
            console.log("LOGIN RESPONSE:", data);g
        }
    });

    // ================= SIGNUP =================
    signupForm && (signupForm.onsubmit = async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const res = await fetch(`${BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Signup successful! Login now.");
                signupBox.style.display = 'none';
                loginBox.style.display = 'block';
            } else {
                alert(data.message || "Signup failed");
            }

        } catch {
            alert("Server is waking up... try again");
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

            const data = await res.json();

            const list = document.getElementById('list');
            const total = document.getElementById('total');

            list.innerHTML = "";
            let sum = 0;

            if (!Array.isArray(data)) return;

            data.forEach(exp => {
                sum += Number(exp.amount);

                const li = document.createElement('li');
                li.innerHTML = `
                    ${exp.description} - ₦${exp.amount}
                    <button data-id="${exp._id}" class="delete-btn">X</button>
                `;
                list.appendChild(li);
            });

            total.textContent = sum;

        } catch (err) {
            console.log(err);
        }
    }

    // ================= DELETE =================
    document.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("delete-btn")) return;

        const id = e.target.getAttribute("data-id");

        try {
            const res = await fetch(`${BASE_URL}/expenses/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                message.textContent = data.message || "Deleted successfully";
                message.style.color = "green";
                loadExpenses();
            } else {
                message.textContent = data.message || "Delete failed";
                message.style.color = "red";
            }

        } catch {
            message.textContent = "Server error";
            message.style.color = "red";
        }
    });

    // ================= ADD =================
    form && (form.onsubmit = async (e) => {
        e.preventDefault();

        const description = document.getElementById('desc').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;

        try {
            const res = await fetch(`${BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ description, amount, category })
            });

            if (res.ok) {
                message.textContent = "Expense added!";
                message.style.color = "green";
                form.reset();
                loadExpenses();
            }

        } catch {
            message.textContent = "Error adding expense";
            message.style.color = "red";
        }
    });

    // ================= LOGOUT =================
    logoutBtn && (logoutBtn.onclick = () => {
        localStorage.removeItem('token');
        token = null;
        checkAuth();
    });

    checkAuth();
});