# 📄 Smart Content Summarizer

A beginner-friendly web app that uses **Groq AI** to summarize long articles into 3 clear bullet points. Features a Spotify-inspired dark UI.

---

## Features

- Paste any long article into the text box
- Click **Summarize** — get 3 concise bullet points in seconds
- Clean loading animation while the AI thinks
- Copy the summary to clipboard with one click
- Fully responsive — works on mobile and desktop
- Secure: API key is stored in `.env`, never in code
- Spotify-inspired dark theme UI

---

## 🗂 Project Structure

```
smart-summarizer/
│
├── server.js           ← Node.js/Express backend
├── package.json        ← Dependencies and project info
├── .env                ← Your secret API key (never share!)
├── .env.example        ← Safe template for teammates
├── public/
│   ├── index.html      ← The webpage
│   ├── style.css       ← Spotify-themed styling
│   └── script.js       ← Frontend logic (fetch, UI updates)
└── README.md           ← You're reading this!
```

---

## Installation

### 1. Install Node.js
Download from [https://nodejs.org](https://nodejs.org) — choose the **LTS** version.

### 2. Clone or download this project
```bash
git clone https://github.com/your-username/smart-content-summarizer.git
cd smart-content-summarizer
```

### 3. Install dependencies
```bash
npm install
```

### 4. Set up your environment variables
```bash
cp .env.example .env
```
Then open `.env` and add your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

> Get your free Groq API key at [console.groq.com](https://console.groq.com) — no credit card required.

---

## How to Run

```bash
node server.js
```

Then open your browser and visit: **http://localhost:3000**

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your free Groq API key. Get one at [console.groq.com](https://console.groq.com) |
| `PORT` | The port the server runs on (default: `3000`) |

> ⚠️ **Never commit your `.env` file to GitHub.** It's already blocked by `.gitignore`.

---

## 🔧 How It Works

```
User pastes article
       ↓
Frontend (script.js) sends POST /summarize with the text
       ↓
Backend (server.js) receives the text
       ↓
Backend sends a prompt to Groq (llama-3.3-70b-versatile model)
       ↓
Groq returns 3 bullet points as JSON
       ↓
Backend sends the bullet points back to the frontend
       ↓
Frontend displays them on the page
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Frontend | HTML + CSS + Vanilla JavaScript |
| Config | dotenv |

---

## 📝 License

MIT — free to use and modify.
