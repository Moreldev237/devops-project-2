import React, { useEffect, useState } from "react";
import axios from "axios";

// En prod, nginx fait proxy de /api vers le backend Django (voir nginx.conf)
const API_URL = "/api/contacts/";

function App() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState(null);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(API_URL);
      setContacts(res.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await axios.post(API_URL, form);
      setForm({ name: "", email: "", message: "" });
      setStatus("success");
      fetchContacts();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="container">
      <h1>Formulaire de Contact</h1>
      <p className="subtitle"> </p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Nom
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            required
          />
        </label>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      {status === "success" && <p className="success">Message envoyé !</p>}
      {status === "error" && <p className="error">Une erreur est survenue.</p>}

      <h2>Messages reçus</h2>
      <ul className="list">
        {contacts.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> ({c.email}) — {c.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
