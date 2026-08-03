document.addEventListener("DOMContentLoaded", () => {

    const loginBox = document.getElementById("login-box");
    const signupBox = document.getElementById("signup-box");
    const forgotBox = document.getElementById("forgot-box");

    const logoutBtn = document.getElementById("logout-btn");

    const showSignup = document.getElementById("show-signup");
    const showLogin = document.getElementById("show-login");
    const showForgot = document.getElementById("show-forgot");
    const backLogin = document.getElementById("back-login");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const forgotForm = document.getElementById("forgot-form");

    const loginMessage = document.getElementById("login-message");
    const signupMessage = document.getElementById("signup-message");
    const forgotMessage = document.getElementById("forgot-message");

    const authWrapper = document.getElementById("auth-wrapper");
    const appContainer = document.getElementById("app");

    const form = document.getElementById("form");
    const list = document.getElementById("list");
    const totalDisplay = document.getElementById("total");

    // Updated BASE_URL to point to local backend
    const BASE_URL = "http://localhost:5000/api";

    let token = localStorage.getItem("token");

    appContainer.style.display = "none";
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

    function showMessage(el, text, color = "red") {

        if (!el) return;

        el.textContent = text;
        el.style.color = color;

        setTimeout(() => {
            el.textContent = "";
        }, 3000);
    }

    loginForm?.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
        document.getElementById("login-email")?.value;

        const password =
        document.getElementById("login-password")?.value;

        try {

            const res = await fetch(
                `${BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if (res.ok && data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "name",
                    data.user?.name || "User"
                );

                authWrapper.style.display = "none";
                appContainer.style.display = "block";

                loadExpenses();

            } else {

                showMessage(
                    loginMessage,
                    data.message
                );
            }

        } catch (err) {

            console.log(err);

            showMessage(
                loginMessage,
                "Server error"
            );
        }
    });

    signupForm?.addEventListener("submit", async (e) => {

        e.preventDefault();

        try {

            const res = await fetch(
                `${BASE_URL}/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name:
                        document.getElementById("signup-name")?.value,

                        email:
                        document.getElementById("signup-email")?.value,

                        password:
                        document.getElementById("signup-password")?.value
                    })
                }
            );

            const data = await res.json();

            if (res.ok) {

                showMessage(
                    signupMessage,
                    "Signup successful",
                    "green"
                );

                switchView(loginBox);

            } else {

                showMessage(
                    signupMessage,
                    data.message
                );
            }

        } catch (err) {

            console.log(err);

            showMessage(
                signupMessage,
                "Server error"
            );
        }
    });

    forgotForm?.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
        document.getElementById("forgot-email")?.value;

        try {

            const res = await fetch(
                `${BASE_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

            const data = await res.json();

            if (res.ok) {

                showMessage(
                    forgotMessage,
                    "Reset link sent to your email",
                    "green"
                );

            } else {

                showMessage(
                    forgotMessage,
                    data.message
                );
            }

        } catch (err) {

            console.log(err);

            showMessage(
                forgotMessage,
                "Server error"
            );
        }
    });

    async function loadExpenses() {

        const token =
        localStorage.getItem("token");

        try {

            const res = await fetch(
                `${BASE_URL}/expenses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const expenses = await res.json();

            list.innerHTML = "";

            let total = 0;

            expenses.forEach((exp) => {

                const li =
                document.createElement("li");

                li.innerHTML = `
                    ${exp.description} - ₦${exp.amount}
                    <button onclick="deleteExpense('${exp._id}')">
                        Delete
                    </button>
                `;

                list.appendChild(li);

                total += Number(exp.amount);
            });

            totalDisplay.textContent = total;

        } catch (err) {

            console.log(err);
        }
    }
    form?.addEventListener("submit", async (e) => {

        e.preventDefault();

        const token =
        localStorage.getItem("token");

        try {

            await fetch(
                `${BASE_URL}/expenses`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        description:
                        document.getElementById("desc").value,

                        amount:
                        document.getElementById("amount").value,

                        category:
                        document.getElementById("category").value
                    })
                }
            );

            form.reset();

            loadExpenses();

        } catch (err) {

            console.log(err);
        }
    });

    window.deleteExpense = async function(id) {

        const token =
        localStorage.getItem("token");

        try {

            await fetch(
                `${BASE_URL}/expenses/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            loadExpenses();

        } catch (err) {

            console.log(err);
        }
    };
    logoutBtn?.addEventListener("click", () => {

        localStorage.clear();

        appContainer.style.display = "none";
        authWrapper.style.display = "flex";

        switchView(loginBox);
    });

    if (token) {

        authWrapper.style.display = "none";
        appContainer.style.display = "block";

        loadExpenses();
    }

});
