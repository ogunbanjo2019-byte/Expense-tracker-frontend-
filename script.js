const balanceDisplay = document.getElementById('total');
const list = document.getElementById('list');
const form = document.getElementById('form');
const descriptionInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');

const API_URL = "https://my-expenses-tracker-9uhz.onrender.com/api/expenses";

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log(data);
  })
  
  .catch(err => console.error("Error:", err));

const getExpenses = () => {
    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            list.innerHTML = '';
            let total = 0;

            for (let i = 0; i < data.length; i++) {
                const expense = data[i];

                const li = document.createElement('li');

                const text = document.createElement('span');
                text.innerText = expense.description + ' (' + expense.category + ')';

                const amount = document.createElement('span');
                amount.innerText = ' ₦' + expense.amount;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Delete';

                deleteBtn.onclick = () => {
                    deleteExpense(expense._id);
                };

                li.appendChild(text);
                li.appendChild(amount);
                li.appendChild(deleteBtn);

                list.appendChild(li);

                total = total + Number(expense.amount);
            }

            balanceDisplay.innerText = '₦' + total;
        })
        .catch((error) => {
            console.log('Error loading expenses', error);
        });
};


const addExpense = (e) => {
    e.preventDefault();

    const description = descriptionInput.value;
    const amount = amountInput.value;
    const category = categoryInput.value;

    if (description === '' || amount === '') {
        alert('Please enter description and amount');
        return;
    }

    const expense = {
        description: description,
        amount: Number(amount),
        category: category
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(expense)
    })
    .then(() => {
        descriptionInput.value = '';
        amountInput.value = '';
        categoryInput.value = '';

        getExpenses();
    })
    .catch((error) => {
        console.log('Error adding expense', error);
    });
};


const deleteExpense = (id) => {
    fetch(API_URL + '/' + id, {
        method: 'DELETE'
    })
    .then(() => {
        getExpenses();
    })
    .catch((error) => {
        console.log('Error deleting expense', error);
    });
};


form.addEventListener('submit', addExpense);

getExpenses();