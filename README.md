# 🎓 NMIT CIE & SGPA Calculator

A clean, fully client-side web app for students of **Nitte Meenakshi Institute of Technology (NMIT)** to track their **Continuous Internal Evaluation (CIE)** marks, check **SEE eligibility**, predict the **Semester End Exam (SEE)** score needed for each grade, and simulate their **SGPA** in real time — no backend, no sign-up, no spreadsheets.

> Built with plain HTML, CSS and JavaScript. Everything runs in the browser and your data is saved locally via `localStorage`.

---

## ✨ Features

- **Two course types** — add Non-Integrated (theory-only) and Integrated (theory + lab) courses, each calculated with the correct NMIT formula.
- **Live CIE calculation** — enter LA-1, LA-2, MSE-1, MSE-2, and Lab marks and watch the CIE score (out of 50) update instantly, including live MSE scaling (×0.3) previews.
- **SEE eligibility tracking** — each course is flagged as Eligible, Warning, or Not Eligible based on the 40% (20/50) CIE rule, with an at-a-glance summary across all courses.
- **SEE target predictor** — for every course, see the minimum raw SEE marks (out of 100) needed to secure each letter grade (P through O), and a full breakdown in a pop-up dialog.
- **SGPA Simulator** — pick a predicted SEE grade for each course from a dropdown and instantly see your projected SGPA on a 10-point scale, with a visual progress bar.
- **Syllabus presets** — one-click load of sample CSE 1st and 3rd semester course lists, or a quick demo semester from the empty state.
- **Persistent state** — all courses and the simulator selections are saved to `localStorage`, so your data survives a page refresh.
- **Light / dark theme toggle** — preference is remembered across sessions.
- **PDF export** — export your CIE/SGPA report via the browser's native print-to-PDF dialog.
- **Built-in guidelines modal** — a reference panel explaining the official NMIT CIE split-up, eligibility criteria, and the full letter-grade table.
- **Responsive, glassmorphism-styled UI** — works on desktop and mobile.

---

## 📐 How the Numbers Work

### CIE Formula (out of 50)

| Course Type | Formula |
|---|---|
| **Non-Integrated** (Theory) | `LA-1 (10) + LA-2 (10) + MSE-1 scaled (15) + MSE-2 scaled (15)` |
| **Integrated** (Theory + Lab) | `MSE-1 scaled (15) + MSE-2 scaled (15) + Lab (20)` |

MSE-1 and MSE-2 are each conducted out of 50 marks and scaled to 15 by multiplying by `0.3`.

### SEE Eligibility

A minimum of **40% of CIE (20/50)** is required to be eligible to sit the SEE for that course. Courses scoring 18–19 are flagged as a **Warning**.

### Final Grade & SGPA

```
Total Marks = CIE + (SEE raw score / 2)
```

The total is then mapped to NMIT's 10-point letter-grade scale:

| Marks (CIE + SEE) | Grade | Points |
|---|---|---|
| ≥ 90 | O (Outstanding) | 10 |
| 80 – 89 | A+ (Excellent) | 9 |
| 70 – 79 | A (Very Good) | 8 |
| 60 – 69 | B+ (Good) | 7 |
| 50 – 59 | B (Above Average) | 6 |
| 45 – 49 | C (Average) | 5 |
| 40 – 44 | P (Pass) | 4 |
| < 40 | F (Fail) | 0 |

SGPA is the credit-weighted average of grade points across all added courses.

---

## 🛠️ Tech Stack

- **HTML5** — semantic markup, native `<dialog>` element for modals
- **CSS3** — custom properties (CSS variables) for theming, glassmorphism cards, responsive grid layout
- **Vanilla JavaScript (ES6+)** — no frameworks, no build step, no dependencies
- **Google Fonts** — `Inter` and `Outfit`
- **`localStorage`** — for persisting courses and theme preference

---

## 📂 Project Structure

```
nmit-cie-calculator/
├── index.html      # App markup, header, dashboard, course board, modal, toasts
├── style.css        # Theming, layout, glassmorphism cards, responsive rules
├── app.js           # State management, CIE/SGPA calculations, rendering, events
└── README.md
```

---

## 🚀 Getting Started

No build tools, package managers, or servers required.

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-username>/nmit-cie-calculator.git
   cd nmit-cie-calculator
   ```
2. **Open it**
   - Double-click `index.html`, **or**
   - Serve it locally for the best experience (recommended so relative font/asset requests behave consistently):
     ```bash
     npx serve .
     # or
     python3 -m http.server 8000
     ```
3. Visit the page in your browser and start adding courses.

### Deploying with GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, choose `main` and `/ (root)`.
4. Your app will be live at `https://<your-username>.github.io/nmit-cie-calculator/`.

---

## 🖱️ Usage

1. Click **+ Theory Course** or **+ Integrated (Lab) Course** to add a course card (or load a **Syllabus Preset** from the sidebar).
2. Edit the course name, credits, and marks (LA-1/LA-2/MSE-1/MSE-2/Lab) directly in the card — the CIE score and eligibility badge update live.
3. Click **SEE Targets** on any course to see the minimum raw SEE score needed for each grade.
4. In the **SGPA Simulator**, pick your predicted SEE grade for each course to see your projected SGPA update instantly.
5. Click **Export PDF Report** to print/save your summary as a PDF.
6. Use the sun/moon icon to toggle light/dark mode, and **CIE Guidelines** to review the official evaluation scheme.

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

This is an independent, unofficial tool created to help students estimate their CIE and SGPA. It is **not affiliated with or endorsed by Nitte Meenakshi Institute of Technology**. Always verify your actual marks and grades against official college records and VTU/NMIT notifications.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 🙏 Acknowledgements

- Fonts by [Google Fonts](https://fonts.google.com/) (`Inter`, `Outfit`)
- Icons adapted from [Feather Icons](https://feathericons.com/)
