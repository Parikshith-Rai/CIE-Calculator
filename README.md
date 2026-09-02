# 🎓 NMIT CIE Hub

A clean, fully client-side web app for students of **Nitte Meenakshi Institute of Technology (NMIT)** to track their **Continuous Internal Evaluation (CIE)** marks, check **SEE eligibility**, predict the **Semester End Exam (SEE)** score needed for each grade, and simulate their **SGPA** in real time — no backend, no sign-up, no spreadsheets.

> Built with plain HTML, CSS and JavaScript. Everything runs in the browser and your data is saved locally via `localStorage`.

---

## ✨ Features

### 📊 Core Calculator
- **Three course types** — Non-Integrated (theory-only), Integrated (theory + lab), and Lab-Only courses, each calculated with the correct NMIT formula.
- **Live CIE calculation** — enter LA-1, LA-2, MSE-1, MSE-2, and Lab marks and watch the CIE score (out of 50) update instantly, including live MSE scaling (×0.3) previews.
- **SEE eligibility tracking** — each course is flagged as Eligible, Warning, or Not Eligible based on the 40% (20/50) CIE rule, with an at-a-glance summary across all courses.
- **SEE target predictor** — for every course, see the minimum raw SEE marks needed to secure each letter grade (P through O) in a pop-up dialog.
- **SGPA Simulator** — pick a predicted SEE grade for each course and instantly see your projected SGPA on a 10-point scale, with a visual arc gauge and progress bar.
- **Syllabus presets** — select your branch (AE, AIDS, AIML, CE, CSE, CSBS, EEE, ECE, VLSI, ISE, ME, RAI) and semester (1st–8th) and load the matching course list in one click.

### 📈 Analytics & Visuals
- **Subject Heatmap** — colour-coded grid showing every course's CIE % at a glance. Five tiers from red (ineligible) to bright green (strong), with hover tooltips showing full course details.
- **Stress Meter** — a fun animated bar that fills up based on how many courses are at risk (ineligible courses count double). Five levels from 😎 Chill to 🔥 Code Red, with course breakdown pills.
- **SGPA Leaderboard** — compare all saved semesters with a ranked list (🥇🥈🥉 medals), animated SVG timeline chart, trend pills (e.g. `▲ +0.42 from Sem 1`), and summary stats (best, average, latest trend).
- **Performance Insights** — personalised feedback on your weakest subjects, ranked by credit-weighted impact on SGPA.
- **CGPA Tracker** — credit-weighted cumulative GPA across all saved semesters, shown with an animated arc gauge, per-semester mini bars, and a target CGPA calculator that tells you what SGPA you need over future semesters.
- **Confetti animation** — fires automatically when all courses cross CIE eligibility, or when you hit an SGPA milestone (7.0 ✨, 8.0 🏅, 9.0 🌟). Pure canvas, no libraries.

### 💾 Data Management
- **Save & compare semesters** — save your current semester's results by name and compare SGPA, credits, and CIE across all saved semesters.
- **Add past semesters** — manually enter SGPA and credits for semesters you completed before using the app.
- **Undo / Redo** — full history stack for all course edits (Ctrl+Z / Ctrl+Shift+Z).
- **Drag-and-drop reordering** — rearrange course cards in any order.
- **Undo-delete toast** — accidentally deleted a course? A toast notification lets you recover it instantly.
- **Persistent state** — all courses, simulator selections, and theme preference are saved to `localStorage`.

### 🛠️ Tools & Export
- **PDF export** — export your full CIE/SGPA report as a clean HTML-rendered PDF (not a browser print dialog).
- **Share result card** — download a PNG snapshot of your results card via html2canvas.
- **Target Score Calculator** — per-course modal showing exactly what marks you need in remaining components to hit your target CIE.
- **What-if nudge system** — component-specific prompts when a course's CIE is below the cushion threshold.
- **Auto-save indicator** — subtle indicator shows when your data has been saved to localStorage.

### 🎨 UI & Accessibility
- **Light / dark theme toggle** — preference remembered across sessions.
- **Compact mode** — toggle a denser layout to see more courses at once.
- **Font size controls** — A− / A / A+ buttons to adjust text size.
- **Custom error pages** — styled 404, 403, 500, 503, and offline pages matching the app theme, with context-specific suggested actions.
- **AI CIE Assistant chatbot** — rule-based chat panel (no API key needed) that answers questions about CIE formulas, eligibility rules, SGPA calculation, and app usage. Includes quick-tap suggestion chips.
- **Responsive, glassmorphism-styled UI** — works on desktop and mobile.
- **Built-in guidelines modal** — a reference panel explaining the official NMIT CIE split-up, eligibility criteria, and the full letter-grade table.

---

## 📐 How the Numbers Work

### CIE Formula (out of 50)

| Course Type | Formula |
|---|---|
| **Non-Integrated** (Theory only) | `LA-1 (10) + LA-2 (10) + best(MSE-1, MSE-2) × 0.3` |
| **Integrated** (Theory + Lab) | `(Theory × 0.6) + (Lab × 0.4 scaled)` where Theory = LA-1 + LA-2 + MSE scaled |
| **Lab-Only** | `Viva (10) + Final Lab Exam (40)` |

MSE-1 and MSE-2 are each conducted out of 50; only the **best** is used, scaled to 30 by multiplying by `0.3`.

### SEE Eligibility

A minimum of **40% of CIE (20/50)** is required to sit the SEE for that course. Courses scoring 18–19 are flagged as a **Warning**.

### Final Grade & SGPA

```
Total Marks = CIE + (SEE raw score / 2)
```

Mapped to NMIT's 10-point letter-grade scale:

| Total Marks | Grade | Points |
|---|---|---|
| ≥ 90 | O (Outstanding) | 10 |
| 80 – 89 | A+ (Excellent) | 9 |
| 70 – 79 | A (Very Good) | 8 |
| 60 – 69 | B+ (Good) | 7 |
| 55 – 59 | B (Above Average) | 6 |
| 50 – 54 | C (Average) | 5 |
| 45 – 49 | P (Pass) | 4 |
| < 45 | F (Fail) | 0 |

SGPA is the credit-weighted average of grade points across all eligible courses.

---

## 🛠️ Tech Stack

- **HTML5** — semantic markup, native `<dialog>` for modals
- **CSS3** — custom properties for theming, glassmorphism cards, responsive grid
- **Vanilla JavaScript (ES6+)** — no frameworks, no build step, no dependencies
- **Node.js + Express** — optional local server (`server.js`) for serving the app via `npm start`
- **Google Fonts** — `Inter` and `Outfit`
- **`localStorage`** — persists courses, theme, and simulator state
- **html2canvas** — PNG snapshot for the Share Result Card feature

---

## 📂 Project Structure

```
nmit-cie-hub/
├── index.html        # App markup, header, sidebar, course board, all modals
├── style.css         # Theming, layout, glassmorphism, heatmap, stress meter, chatbot
├── app.js            # State, CIE/SGPA logic, rendering, events, confetti, chatbot
├── server.js         # Express server — run locally with npm start
├── package.json      # Node.js dependencies (express, nodemon)
├── README.md
├── 404.html          # Page not found error page
├── 403.html          # Access denied error page
├── 500.html          # Internal server error page
├── 503.html          # Maintenance error page
└── offline.html      # Network error page
```

---

## 🚀 Getting Started

### Option A — Open directly (no setup)

1. **Clone the repo**
   ```bash
   git clone https://github.com/Parikshith-Rai/nmit-cie-hub.git
   cd nmit-cie-hub
   ```
2. Double-click `index.html` — done. No install needed.

### Option B — Run with Express (recommended)

1. **Clone the repo**
   ```bash
   git clone https://github.com/Parikshith-Rai/nmit-cie-hub.git
   cd nmit-cie-hub
   ```
2. **Install dependencies** (first time only)
   ```bash
   npm install
   ```
3. **Start the server**
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

> **Tip:** Use `npm run dev` during development — it uses `nodemon` to auto-restart the server on changes.

The Express server also wires up your custom error pages automatically — `404.html` for missing routes and `500.html` for any server crash.

### Deploying with GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, choose `main` and `/ (root)`.
4. Your app will be live at `https://Parikshith-Rai.github.io/nmit-cie-hub/`.
5. The `404.html` file is served automatically by GitHub Pages for any missing URL — no extra config needed.

---

## 🖱️ Usage

1. Click **+ Theory Course**, **+ Integrated Course**, or **+ Lab Course** to add a course card, or load a **Syllabus Preset** from the sidebar.
2. Edit the course name, credits, and marks directly in the card — CIE and eligibility update live.
3. Click **SEE Targets** on any course to see the minimum raw SEE score needed for each grade.
4. In the **SGPA Simulator**, pick your predicted SEE grade for each course to see your projected SGPA update instantly.
5. Watch the **Stress Meter** and **Subject Heatmap** in the sidebar update as you enter marks.
6. **Save** your semester results and open the **🏆 SGPA Leaderboard** to track your progress over time.
7. Use the **CIE Assistant** chatbot (bottom-right) to ask questions about eligibility rules, formulas, or SGPA.
8. Click **Export PDF Report** to save your summary, or **Share Result Card** to download a PNG.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

This is an independent, unofficial tool created to help students estimate their CIE and SGPA. It is **not affiliated with or endorsed by Nitte Meenakshi Institute of Technology**. Always verify your actual marks and grades against official college records and NMIT notifications.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 🙏 Acknowledgements

- Fonts by [Google Fonts](https://fonts.google.com/) (`Inter`, `Outfit`)
- Icons adapted from [Feather Icons](https://feathericons.com/)
- Share card screenshot via [html2canvas](https://html2canvas.hertzen.com/)