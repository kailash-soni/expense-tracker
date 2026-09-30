
import { useEffect, useState } from "react";
import API_URL from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [editingId, setEditingId] = useState(null);
  const [showRegister, setShowRegister] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setExpenses([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/expenses${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title,
            amount,
            category,
            date,
            description,
          }),
        }
      );

      const data = await response.json();

      console.log("Expense response:", data);
      console.log("Response status:", response.status);

      if (!response.ok) {
        setError(data.message || "Failed to save expense");
        return;
      }

      if (editingId) {
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense._id === editingId ? data : expense
          )
        );
      } else {
        setExpenses((prevExpenses) => [...prevExpenses, data]);
      }

      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
      setDescription("");
      setEditingId(null);
    } catch (error) {
      console.error("Expense error:", error.message);
      setError("Unable to connect to the server. Please try again.");
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date ? expense.date.split("T")[0] : "");
    setDescription(expense.description || "");
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setCategory("");
    setDate("");
    setDescription("");
    setError("");
  };

  const handleDelete = async (id) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      console.log("Delete response:", data);

      if (!response.ok) {
        setError(data.message || "Failed to delete expense");
        return;
      }

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== id)
      );

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Delete error:", error.message);
      setError("Unable to connect to the server. Please try again.");
    }
  };

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    const fetchExpenses = async () => {
      setError("");

      try {
        const response = await fetch(`${API_URL}/expenses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));

          if (response.status === 401) {
            localStorage.removeItem("token");
            setLoggedIn(false);
            setError("Session expired. Please login again.");
            return;
          }

          throw new Error(data.message || "Failed to fetch expenses");
        }

        const data = await response.json();

        setExpenses(data);
        console.log("Expenses:", data);
      } catch (error) {
        console.error("Error:", error.message);
        setError("Unable to load expenses. Please try again.");
      }
    };

    fetchExpenses();
  }, [loggedIn]);

  return (
    <>
      {!loggedIn && !showRegister && (
        <Login
          onLogin={() => setLoggedIn(true)}
          onShowRegister={() => setShowRegister(true)}
        />
      )}

      {!loggedIn && showRegister && (
        <Register onRegister={() => setShowRegister(false)} />
      )}

      {loggedIn && (
        <div className="summary-card">
          <h1>Expense Tracker</h1>

          <button onClick={handleLogout}>Logout</button>

          {error && <p>{error}</p>}

          <div>
            <div className="summary-card">
              <p>Total Entries</p>
              <strong>{expenses.length}</strong>
            </div>

            <div className="sunnary-card">
              <p>Total Spent</p>
              <strong>
                ₹
                {expenses.reduce(
                  (total, expense) => total + Number(expense.amount),
                  0
                )}
              </strong>
            </div>

            <div>
              <p>This Month</p>
              <strong>
                ₹
                {expenses
                  .filter((expense) => {
                    const expenseDate = new Date(expense.date);
                    const today = new Date();

                    return (
                      expenseDate.getMonth() === today.getMonth() &&
                      expenseDate.getFullYear() === today.getFullYear()
                    );
                  })
                  .reduce(
                    (total, expense) => total + Number(expense.amount),
                    0
                  )}
              </strong>
            </div>

            <div>
              <p>This Week</p>
              <strong>
                ₹
                {expenses
                  .filter((expense) => {
                    const expenseDate = new Date(expense.date);
                    const today = new Date();

                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(
                      today.getDate() - today.getDay()
                    );
                    startOfWeek.setHours(0, 0, 0, 0);

                    return (
                      expenseDate >= startOfWeek &&
                      expenseDate <= today
                    );
                  })
                  .reduce(
                    (total, expense) => total + Number(expense.amount),
                    0
                  )}
              </strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="expense-title">Title</label>
            <input
              id="expense-title"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="expense-amount">Amount</label>
            <input
              id="expense-amount"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label htmlFor="expense-category">Category</label>
            <input
              id="expense-category"
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <label htmlFor="expense-date">Date</label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label htmlFor="expense-description">
              Description
            </label>
            <input
              id="expense-description"
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </form>

          <div>
            <h2>Expenses</h2>

            {expenses.map((expense) => (
              <div key={expense._id}>
                <p>{expense.title}</p>
                <p>₹{expense.amount}</p>
                <p>{expense.category}</p>
                <p>{expense.description}</p>

                <button onClick={() => handleEdit(expense)}>
                  Edit
                </button>

                <button onClick={() => handleDelete(expense._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;

