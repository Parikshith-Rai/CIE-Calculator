/* ==========================================================================
   NMIT CIE & SGPA CALCULATOR - REACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

// --- STATE MANAGEMENT ---
let courses = [];
const DEFAULT_THEME = 'dark';

// --- ELEMENT SELECTORS ---
const themeToggle = document.getElementById('theme-toggle');
const btnInfo = document.getElementById('btn-info');
const guidelinesModal = document.getElementById('guidelines-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnAddNonIntegrated = document.getElementById('btn-add-non-integrated');
const btnAddIntegrated = document.getElementById('btn-add-integrated');
const emptyState = document.getElementById('courses-empty-state');
const btnEmptyDemo = document.getElementById('btn-empty-demo');
const courseCardsList = document.getElementById('course-cards-list');
const toastContainer = document.getElementById('toast-container');

// Sidebar summary selectors
const overallCieValue = document.getElementById('overall-cie-value');

const totalCreditsSpan = document.getElementById('total-credits');
const courseCountSpan = document.getElementById('course-count');
const eligibilityStatusSpan = document.getElementById('eligibility-status');
const sgpaScoreSpan = document.getElementById('sgpa-score');
const sgpaProgressBar = document.getElementById('sgpa-progress-bar');
const sgpaBreakdownList = document.getElementById('sgpa-breakdown');
const btnExportPdf = document.getElementById('btn-export-pdf');

// Presets selectors
const presetBranch = document.getElementById('preset-branch');
const presetSemester = document.getElementById('preset-semester');
const btnLoadPreset = document.getElementById('btn-load-preset');
const btnPresetReset = document.getElementById('btn-preset-reset');

// --- PRESET DATABASES ---
// Semester 2 integrated/non-integrated determined by L-T-P from official NMIT timetable (AY 2025-26)
// Integrated = has lab hours (P > 0): PHY102(3-0-2), ECE101(2-0-2), CSE102(2-0-2),
//              CHY103/104(3-0-2), MEC101(2-0-2), CHY102(3-0-2)
// Non-Integrated = no lab hours: MAT106(3-1-0), EEE102(3-0-0), HSS102(2-0-0), etc.

// ── SEM 1 HELPERS ────────────────────────────────────────────────────────────
function _itSem1() {
  return [
    { name: "Calculus and Linear Algebra", type: "non-integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Materials Chemistry", type: "integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Problem Solving Through Programming", type: "integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Engineering Graphics", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "English", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }
  ];
}

function _nonItSem1() {
  return [
    { name: "Calculus and Linear Algebra", type: "non-integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Mathematics with MATLAB", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Introduction to C Programming", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Wave Mechanics", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
    { name: "Engineering Graphics", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }
  ];
}

// ── SEM 2 HELPERS ────────────────────────────────────────────────────────────
// CSE / CSBS / ISE / AIDS / AIML / RAI — identical Sem 2 subjects
function _itSem2() {
  return [
    { name: "Linear Algebra and Transform Techniques", type: "non-integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },   // MAT106 3-1-0
    { name: "Quantum Computing and Modern Physics",    type: "integrated",     credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },   // PHY102 3-0-2
    { name: "Applied Digital Logic Design",            type: "integrated",     credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },   // ECE101 2-0-2
    { name: "Elements of Electrical Engineering",     type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },   // EEE102 3-0-0
    { name: "Introduction to Python Programming",     type: "integrated",     credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },   // CSE102 2-0-2
    { name: "Universal Human Values & Professional Ethics", type: "non-integrated", credits: 2, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // HSS102 2-0-0
    { name: "Mathematics with MATLAB",                type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 },    // MAT107 EXT=0
    { name: "Constitution of India & Global Citizenship", type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 }, // HSS101 EXT=0
    { name: "Pathways to Success",                    type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 }     // HSS133 no EXT
  ];
}

// EEE / VLSI / ECE — use MAT105, CHY104, MEC112 instead
function _eeeGroupSem2() {
  return [
    { name: "Differential Equations and Laplace Transforms", type: "non-integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // MAT105 3-1-0
    { name: "Materials Chemistry for Devices and E-Waste",   type: "integrated",     credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // CHY104 3-0-2
    { name: "Elements of Mechanical Engineering",            type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // MEC112 3-0-0
    { name: "Applied Digital Logic Design",                  type: "integrated",     credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // ECE101 2-0-2
    { name: "Environmental Science & Sustainability",        type: "non-integrated", credits: 2, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // CIV104 2-0-0
    { name: "Universal Human Values & Professional Ethics",  type: "non-integrated", credits: 2, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // HSS102 2-0-0
    { name: "Biology for Engineers",                         type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // BTY111 1-0-0
    { name: "IT Skills",                                     type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 },  // CSE121 no EXT
    { name: "Pathways to Success",                           type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 }   // HSS133 no EXT
  ];
}

// CE / ME / AE — MAT104, CHY103 (integrated), MEC101-CAED (integrated)
function _civilMechAeroSem2(chemName) {
  return [
    { name: "Matrix Algebra and Differential Equations", type: "non-integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // MAT104 3-1-0
    { name: chemName,                                    type: "integrated",     credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // CHY103/102 3-0-2
    { name: "Computer Aided Engineering Graphics",       type: "integrated",     credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // MEC101 2-0-2
    { name: "Engineering Mechanics",                     type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // CIV111 3-0-0
    { name: "Environmental Science & Sustainability",    type: "non-integrated", credits: 2, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // CIV104 2-0-0
    { name: "Universal Human Values & Professional Ethics", type: "non-integrated", credits: 2, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // HSS102 2-0-0
    { name: "Biology for Engineers",                     type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // BTY111 1-0-0
    { name: "IT Skills",                                 type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }, // CSE121 0-0-2
    { name: "Constitution of India & Global Citizenship", type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 }, // HSS101 EXT=0
    { name: "Pathways to Success",                       type: "non-integrated", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 0 }  // HSS133 no EXT
  ];
}

const PRESETS = {
  "CSE": {
    "1": _itSem1(),
    "2": _itSem2(),
    "3": [
      { name: "Discrete Mathematical Structures",    type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
      { name: "Data Structures & Applications",      type: "integrated",     credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
      { name: "Computer Organization & Architecture",type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
      { name: "Analog & Digital Electronics",        type: "integrated",     credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 },
      { name: "Object Oriented Programming with Java", type: "integrated",   credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }
    ]
  },
  "CSBS": { "1": _itSem1(), "2": _itSem2() },
  "ISE":  { "1": _itSem1(), "2": _itSem2() },
  "AIDS": { "1": _itSem1(), "2": _itSem2() },
  "AIML": { "1": _itSem1(), "2": _itSem2() },
  "RAI":  { "1": _nonItSem1(), "2": _itSem2() },
  "EEE":  { "1": _itSem1(), "2": _eeeGroupSem2() },
  "VLSI": { "1": _itSem1(), "2": _eeeGroupSem2() },
  "ECE":  { "1": _itSem1(), "2": _eeeGroupSem2() },
  "CE":   { "1": _nonItSem1(), "2": _civilMechAeroSem2("Chemistry for Civil Engineering") },
  "ME":   { "1": _nonItSem1(), "2": _civilMechAeroSem2("Materials Chemistry and Energy Applications") },
  "AE":   { "1": _nonItSem1(), "2": _civilMechAeroSem2("Materials Chemistry and Energy Applications") }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadState();
  renderApp();
  
  // Set up modal controls
  btnInfo.addEventListener('click', () => guidelinesModal.showModal());
  btnCloseModal.addEventListener('click', () => guidelinesModal.close());
  guidelinesModal.addEventListener('click', (e) => {
    if (e.target === guidelinesModal) guidelinesModal.close();
  });
  
  // Set up add buttons
  btnAddNonIntegrated.addEventListener('click', () => addCourse('non-integrated'));
  btnAddIntegrated.addEventListener('click', () => addCourse('integrated'));
  btnEmptyDemo.addEventListener('click', () => {
    // Load CSE Sem 2 as the demo
    presetBranch.value = 'CSE';
    presetSemester.value = '2';
    loadPreset('CSE', '2');
  });
  
  // Presets controls
  btnLoadPreset.addEventListener('click', () => {
    const branch = presetBranch.value;
    const sem = presetSemester.value;
    if (!branch || !sem) {
      showToast('Please select both a branch and semester', 'warning');
      return;
    }
    loadPreset(branch, sem);
  });
  btnPresetReset.addEventListener('click', clearAllCourses);
  
  // PDF Export
  btnExportPdf.addEventListener('click', () => {
    window.print();
  });
});

// --- THEME MANAGEMENT ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Switched to ${newTheme} mode`, 'success');
  });
}

// --- DATA PERSISTENCE ---
function saveState() {
  localStorage.setItem('nmit_cie_courses', JSON.stringify(courses));
}

function loadState() {
  const saved = localStorage.getItem('nmit_cie_courses');
  if (saved) {
    try {
      courses = JSON.parse(saved);
    } catch (e) {
      courses = [];
    }
  }
}

// --- CALCULATION HELPER FUNCTIONS ---
function calculateCourseCIE(course) {
  const mse1Scaled = (course.mse1 || 0) * 0.3;
  const mse2Scaled = (course.mse2 || 0) * 0.3;
  
  if (course.type === 'non-integrated') {
    const la1Val = course.la1 || 0;
    const la2Val = course.la2 || 0;
    return parseFloat((la1Val + la2Val + mse1Scaled + mse2Scaled).toFixed(1));
  } else {
    const labVal = course.lab || 0;
    return parseFloat((mse1Scaled + mse2Scaled + labVal).toFixed(1));
  }
}

function getCIEStatus(cie) {
  if (cie >= 20) return { label: 'Eligible', class: 'status-good' };
  if (cie >= 18) return { label: 'Warning', class: 'status-warning' };
  return { label: 'Not Eligible', class: 'status-danger' };
}

// Map marks to NMIT grade point
function getGradePoints(totalMarks) {
  if (totalMarks >= 90) return { grade: 'O', points: 10, class: 'g-o' };
  if (totalMarks >= 80) return { grade: 'A+', points: 9, class: 'g-ap' };
  if (totalMarks >= 70) return { grade: 'A', points: 8, class: 'g-a' };
  if (totalMarks >= 60) return { grade: 'B+', points: 7, class: 'g-bp' };
  if (totalMarks >= 50) return { grade: 'B', points: 6, class: 'g-b' };
  if (totalMarks >= 45) return { grade: 'C', points: 5, class: 'g-c' };
  if (totalMarks >= 40) return { grade: 'P', points: 4, class: 'g-p' };
  return { grade: 'F', points: 0, class: 'g-f' };
}

// Calculate required raw SEE marks to hit specific grades
function getSEETargets(cie) {
  // Total Marks = CIE + (SEE_raw / 2)
  // SEE_raw = (Total Marks - CIE) * 2
  // Requirements:
  // 1. Min SEE_raw = 40 (passing min of 40%)
  // 2. Max SEE_raw = 100
  
  if (cie < 20) {
    return { possible: false, reason: 'Ineligible (CIE < 20)' };
  }
  
  const grades = [
    { name: 'O', minTotal: 90 },
    { name: 'A+', minTotal: 80 },
    { name: 'A', minTotal: 70 },
    { name: 'B+', minTotal: 60 },
    { name: 'B', minTotal: 50 },
    { name: 'C', minTotal: 45 },
    { name: 'P', minTotal: 40 }
  ];
  
  const targets = {};
  
  grades.forEach(g => {
    let rawNeeded = (g.minTotal - cie) * 2;
    if (rawNeeded > 100) {
      targets[g.name] = 'Impossible';
    } else if (rawNeeded < 40) {
      // Must score at least 40/100 to pass SEE anyway
      targets[g.name] = '40*'; // Note that this is the baseline passing marks
    } else {
      targets[g.name] = Math.ceil(rawNeeded);
    }
  });
  
  return { possible: true, targets };
}

// --- RENDER APP & DYNAMIC UPDATING ---
function renderApp() {
  renderCourseBoard();
  renderSidebar();
}

function renderCourseBoard() {
  if (courses.length === 0) {
    emptyState.style.display = 'flex';
    courseCardsList.innerHTML = '';
    return;
  }
  
  emptyState.style.display = 'none';
  courseCardsList.innerHTML = '';
  
  courses.forEach(course => {
    const cie = calculateCourseCIE(course);
    const status = getCIEStatus(cie);
    const isIntegrated = course.type === 'integrated';
    
    // Create card element
    const card = document.createElement('div');
    card.className = `glass-card course-card ${isIntegrated ? 'integrated' : ''}`;
    card.dataset.id = course.id;
    
    // Header section
    let headerHTML = `
      <div class="course-card-header">
        <div class="course-meta-inputs">
          <input type="text" class="input-course-name" value="${course.name}" placeholder="Enter Course Name" aria-label="Course Name">
          <div class="input-field-group">
            <input type="number" class="input-credits" value="${course.credits}" min="1" max="10" placeholder="Credits" title="Course Credits" aria-label="Course Credits">
          </div>
          <span class="course-badge">${isIntegrated ? 'Integrated (Lab)' : 'Non-Integrated'}</span>
        </div>
        <div class="course-card-actions">
          <button class="btn-icon btn-duplicate" title="Duplicate Course">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="btn-icon btn-delete" title="Delete Course">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Body section (inputs)
    let bodyHTML = '';
    if (!isIntegrated) {
      // Non-integrated (LA1, LA2, MSE1, MSE2)
      bodyHTML = `
        <div class="course-card-body">
          <div class="marks-inputs-grid">
            <div class="input-field-group">
              <label>LA-1 <span class="label-max-tag">Max 10</span></label>
              <input type="number" class="input-mark input-la1" value="${course.la1}" min="0" max="10" step="0.5" aria-label="LA-1 marks">
            </div>
            <div class="input-field-group">
              <label>LA-2 <span class="label-max-tag">Max 10</span></label>
              <input type="number" class="input-mark input-la2" value="${course.la2}" min="0" max="10" step="0.5" aria-label="LA-2 marks">
            </div>
            <div class="input-field-group">
              <label>MSE-1 <span class="label-max-tag">Max 50</span></label>
              <div class="input-numeric-wrapper">
                <input type="number" class="input-mark input-mse1" value="${course.mse1}" min="0" max="50" step="0.5" aria-label="MSE-1 marks">
                <span class="scaling-info">→ ${(course.mse1 * 0.3).toFixed(1)}</span>
              </div>
            </div>
            <div class="input-field-group">
              <label>MSE-2 <span class="label-max-tag">Max 50</span></label>
              <div class="input-numeric-wrapper">
                <input type="number" class="input-mark input-mse2" value="${course.mse2}" min="0" max="50" step="0.5" aria-label="MSE-2 marks">
                <span class="scaling-info">→ ${(course.mse2 * 0.3).toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div class="course-card-result">
            <span class="result-cie-value">${cie}</span>
            <span class="result-cie-label">CIE Score</span>
            <span class="status-badge ${status.class}">${status.label}</span>
          </div>
        </div>
      `;
    } else {
      // Integrated (MSE1, MSE2, Lab)
      bodyHTML = `
        <div class="course-card-body">
          <div class="marks-inputs-grid">
            <div class="input-field-group">
              <label>MSE-1 <span class="label-max-tag">Max 50</span></label>
              <div class="input-numeric-wrapper">
                <input type="number" class="input-mark input-mse1" value="${course.mse1}" min="0" max="50" step="0.5" aria-label="MSE-1 marks">
                <span class="scaling-info">→ ${(course.mse1 * 0.3).toFixed(1)}</span>
              </div>
            </div>
            <div class="input-field-group">
              <label>MSE-2 <span class="label-max-tag">Max 50</span></label>
              <div class="input-numeric-wrapper">
                <input type="number" class="input-mark input-mse2" value="${course.mse2}" min="0" max="50" step="0.5" aria-label="MSE-2 marks">
                <span class="scaling-info">→ ${(course.mse2 * 0.3).toFixed(1)}</span>
              </div>
            </div>
            <div class="input-field-group span-2">
              <label>Lab Assessment <span class="label-max-tag">Max 20</span></label>
              <input type="number" class="input-mark input-lab" value="${course.lab}" min="0" max="20" step="0.5" aria-label="Lab marks">
            </div>
          </div>
          
          <div class="course-card-result">
            <span class="result-cie-value">${cie}</span>
            <span class="result-cie-label">CIE Score</span>
            <span class="status-badge ${status.class}">${status.label}</span>
          </div>
        </div>
      `;
    }
    
    // Footer section (tips/targets)
    const targetsInfo = getSEETargets(cie);
    let footerHTML = '';
    
    if (targetsInfo.possible) {
      // Calculate what raw SEE marks are needed for an O or passing
      const targets = targetsInfo.targets;
      let minPass = targets['P'];
      let targetO = targets['O'];
      
      let hintText = `To pass SEE, score at least <strong>${minPass}</strong>.`;
      if (targetO !== 'Impossible') {
        hintText += ` For O Grade: <strong>${targetO}</strong>.`;
      } else if (targets['A+'] !== 'Impossible') {
        hintText += ` For A+ Grade: <strong>${targets['A+']}</strong>.`;
      }
      
      footerHTML = `
        <div class="course-card-footer">
          <div class="grade-tips-container">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>${hintText}</span>
          </div>
          <button class="see-targets-badge btn-view-targets">
            SEE Targets
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      `;
    } else {
      footerHTML = `
        <div class="course-card-footer">
          <div class="grade-tips-container text-danger">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>You need at least 20 CIE marks to be eligible for SEE.</span>
          </div>
        </div>
      `;
    }
    
    card.innerHTML = headerHTML + bodyHTML + footerHTML;
    courseCardsList.appendChild(card);
    
    // Add event listeners for inputs
    bindCardEvents(card, course.id);
  });
}

function bindCardEvents(cardElement, courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;
  
  // Name input
  const nameInput = cardElement.querySelector('.input-course-name');
  nameInput.addEventListener('input', (e) => {
    course.name = e.target.value;
    saveState();
    updateSidebarSgpaList();
  });
  
  // Credits input
  const creditsInput = cardElement.querySelector('.input-credits');
  creditsInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 1;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    course.credits = val;
    saveState();
    renderSidebar();
  });
  
  // Numerical marks inputs
  const markInputs = cardElement.querySelectorAll('.input-mark');
  markInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const inputEl = e.target;
      let val = parseFloat(inputEl.value);
      
      // Get min / max for validation
      const min = parseFloat(inputEl.min) || 0;
      const max = parseFloat(inputEl.max) || 100;
      
      if (isNaN(val)) {
        val = 0;
      }
      
      // Validate bounds
      if (val < min) {
        val = min;
        inputEl.value = min;
        inputEl.classList.add('invalid');
      } else if (val > max) {
        val = max;
        inputEl.value = max;
        inputEl.classList.add('invalid');
      } else {
        inputEl.classList.remove('invalid');
      }
      
      // Map back to course object based on input class
      if (inputEl.classList.contains('input-la1')) course.la1 = val;
      if (inputEl.classList.contains('input-la2')) course.la2 = val;
      if (inputEl.classList.contains('input-mse1')) {
        course.mse1 = val;
        // Update live scaling text
        const scalingSpan = inputEl.nextElementSibling;
        if (scalingSpan) scalingSpan.innerText = `→ ${(val * 0.3).toFixed(1)}`;
      }
      if (inputEl.classList.contains('input-mse2')) {
        course.mse2 = val;
        // Update live scaling text
        const scalingSpan = inputEl.nextElementSibling;
        if (scalingSpan) scalingSpan.innerText = `→ ${(val * 0.3).toFixed(1)}`;
      }
      if (inputEl.classList.contains('input-lab')) course.lab = val;
      
      // Update this card's CIE score and UI components reactively
      const newCie = calculateCourseCIE(course);
      const newStatus = getCIEStatus(newCie);
      
      const valueSpan = cardElement.querySelector('.result-cie-value');
      valueSpan.innerText = newCie;
      
      const badgeSpan = cardElement.querySelector('.status-badge');
      badgeSpan.innerText = newStatus.label;
      badgeSpan.className = `status-badge ${newStatus.class}`;
      
      // Update footer tips
      const footer = cardElement.querySelector('.course-card-footer');
      if (footer) {
        const targetsInfo = getSEETargets(newCie);
        if (targetsInfo.possible) {
          const targets = targetsInfo.targets;
          let minPass = targets['P'];
          let targetO = targets['O'];
          let hintHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>`;
          let hintText = `To pass SEE, score at least <strong>${minPass}</strong>.`;
          if (targetO !== 'Impossible') {
            hintText += ` For O Grade: <strong>${targetO}</strong>.`;
          } else if (targets['A+'] !== 'Impossible') {
            hintText += ` For A+ Grade: <strong>${targets['A+']}</strong>.`;
          }
          footer.querySelector('.grade-tips-container').innerHTML = hintHTML + `<span>${hintText}</span>`;
          footer.querySelector('.grade-tips-container').className = "grade-tips-container";
        } else {
          footer.querySelector('.grade-tips-container').innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>You need at least 20 CIE marks to be eligible for SEE.</span>
          `;
          footer.querySelector('.grade-tips-container').className = "grade-tips-container text-danger";
        }
      }
      
      saveState();
      renderSidebar();
    });
  });
  
  // Duplicate course button
  cardElement.querySelector('.btn-duplicate').addEventListener('click', () => {
    duplicateCourse(courseId);
  });
  
  // Delete course button
  cardElement.querySelector('.btn-delete').addEventListener('click', () => {
    deleteCourse(courseId);
  });
  
  // Show detailed targets popup
  const targetsBtn = cardElement.querySelector('.btn-view-targets');
  if (targetsBtn) {
    targetsBtn.addEventListener('click', () => {
      showDetailedTargetsToast(course);
    });
  }
}

function renderSidebar() {
  if (courses.length === 0) {
    overallCieValue.innerText = '0.0';

    totalCreditsSpan.innerText = '0';
    courseCountSpan.innerText = '0';
    eligibilityStatusSpan.innerText = 'No Courses';
    eligibilityStatusSpan.className = 'status-badge';
    sgpaScoreSpan.innerText = '0.00';
    sgpaProgressBar.style.width = '0%';
    sgpaBreakdownList.innerHTML = '<p class="card-desc text-center" style="margin: 0">Add courses to see GPA breakdown</p>';
    return;
  }
  
  // Calculate average CIE
  let totalCie = 0;
  let totalCredits = 0;
  let ineligibleCount = 0;
  let warningCount = 0;
  
  courses.forEach(c => {
    const cie = calculateCourseCIE(c);
    totalCie += cie;
    totalCredits += parseInt(c.credits) || 0;
    
    if (cie < 20) {
      ineligibleCount++;
    } else if (cie < 22) {
      warningCount++;
    }
  });
  
  const avgCie = parseFloat((totalCie / courses.length).toFixed(1));
  overallCieValue.innerText = avgCie;
  

  
  // Set stats fields
  totalCreditsSpan.innerText = totalCredits;
  courseCountSpan.innerText = courses.length;
  
  // Eligibility status
  if (ineligibleCount > 0) {
    eligibilityStatusSpan.innerText = `${ineligibleCount} Ineligible`;
    eligibilityStatusSpan.className = 'status-badge status-danger';
  } else if (warningCount > 0) {
    eligibilityStatusSpan.innerText = `${warningCount} Warning`;
    eligibilityStatusSpan.className = 'status-badge status-warning';
  } else {
    eligibilityStatusSpan.innerText = 'All Eligible';
    eligibilityStatusSpan.className = 'status-badge status-good';
  }
  
  updateSidebarSgpaList();
}

function updateSidebarSgpaList() {
  sgpaBreakdownList.innerHTML = '';
  
  let totalGradePoints = 0;
  let totalCredits = 0;
  
  courses.forEach(course => {
    const cie = calculateCourseCIE(course);
    
    const item = document.createElement('div');
    item.className = 'sgpa-item';
    
    // Create grade dropdown select
    // Options: Predicted SEE marks (we'll let them select their expected SEE score and show the final grade)
    const predictedSEE = course.seePredicted !== undefined ? course.seePredicted : 80;
    const finalScore = Math.min(100, Math.round(cie + (predictedSEE / 2)));
    const gradeObj = cie >= 20 ? getGradePoints(finalScore) : { grade: 'F', points: 0, class: 'g-f' };
    
    item.innerHTML = `
      <div>
        <div class="sgpa-item-name">${course.name || 'Untitled Course'}</div>
        <div class="sgpa-item-credits">${course.credits} Credits • CIE: ${cie}</div>
      </div>
      <div>
        <select class="sgpa-item-grade-select" data-id="${course.id}" aria-label="Predicted SEE score for ${course.name}">
          <option value="100" ${predictedSEE === 100 ? 'selected' : ''}>O (SEE: 100)</option>
          <option value="90" ${predictedSEE === 90 ? 'selected' : ''}>A+ (SEE: 90)</option>
          <option value="80" ${predictedSEE === 80 ? 'selected' : ''}>A (SEE: 80)</option>
          <option value="70" ${predictedSEE === 70 ? 'selected' : ''}>B+ (SEE: 70)</option>
          <option value="60" ${predictedSEE === 60 ? 'selected' : ''}>B (SEE: 60)</option>
          <option value="50" ${predictedSEE === 50 ? 'selected' : ''}>C (SEE: 50)</option>
          <option value="40" ${predictedSEE === 40 ? 'selected' : ''}>P (SEE: 40)</option>
          <option value="0" ${predictedSEE === 0 ? 'selected' : ''}>F (SEE: 0)</option>
        </select>
      </div>
    `;
    
    sgpaBreakdownList.appendChild(item);
    
    // Bind select change
    const select = item.querySelector('.sgpa-item-grade-select');
    select.addEventListener('change', (e) => {
      course.seePredicted = parseInt(e.target.value);
      saveState();
      calculateSGPA();
    });
    
    // Sum for SGPA
    totalGradePoints += gradeObj.points * course.credits;
    totalCredits += course.credits;
  });
  
  calculateSGPA();
}

function calculateSGPA() {
  let totalGradePoints = 0;
  let totalCredits = 0;
  
  courses.forEach(course => {
    const cie = calculateCourseCIE(course);
    if (cie < 20) {
      // Automatic F grade points if ineligible
      totalGradePoints += 0;
    } else {
      const predictedSEE = course.seePredicted !== undefined ? course.seePredicted : 80;
      const finalScore = Math.min(100, Math.round(cie + (predictedSEE / 2)));
      const gradeObj = getGradePoints(finalScore);
      totalGradePoints += gradeObj.points * course.credits;
    }
    totalCredits += course.credits;
  });
  
  const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0.00;
  sgpaScoreSpan.innerText = sgpa.toFixed(2);
  
  // Set SGPA progress bar fill (10 is max GPA)
  const barPercent = (sgpa / 10) * 100;
  sgpaProgressBar.style.width = `${barPercent}%`;
}

// --- COURSE OPERATIONS ---
function addCourse(type) {
  const newCourse = {
    id: 'course_' + Date.now(),
    name: type === 'non-integrated' ? `Theory Course ${courses.length + 1}` : `Integrated Course ${courses.length + 1}`,
    type: type,
    credits: 4,
    la1: type === 'non-integrated' ? 8 : 0,
    la2: type === 'non-integrated' ? 8 : 0,
    mse1: 40,
    mse2: 40,
    lab: type === 'integrated' ? 16 : 0,
    seePredicted: 80
  };
  
  courses.push(newCourse);
  saveState();
  renderApp();
  showToast(`Added new ${type} course`, 'success');
}

function duplicateCourse(id) {
  const index = courses.findIndex(c => c.id === id);
  if (index === -1) return;
  
  const original = courses[index];
  const copy = {
    ...original,
    id: 'course_' + Date.now(),
    name: original.name + ' (Copy)'
  };
  
  courses.splice(index + 1, 0, copy);
  saveState();
  renderApp();
  showToast(`Duplicated "${original.name}"`, 'success');
}

function deleteCourse(id) {
  const index = courses.findIndex(c => c.id === id);
  if (index === -1) return;
  
  const deletedName = courses[index].name;
  courses.splice(index, 1);
  saveState();
  renderApp();
  showToast(`Deleted "${deletedName}"`, 'warning');
}

function loadPreset(branch, sem) {
  const branchData = PRESETS[branch];
  if (!branchData) {
    showToast(`No preset found for ${branch}`, 'warning');
    return;
  }
  const preset = branchData[sem];
  if (!preset) {
    showToast(`No preset for ${branch} Semester ${sem} yet`, 'warning');
    return;
  }
  
  courses = preset.map((c, i) => ({
    ...c,
    id: `preset_${branch}_${sem}_${i}_${Date.now()}`
  }));
  
  saveState();
  renderApp();
  showToast(`Loaded ${branch} Semester ${sem} preset`, 'success');
}

function clearAllCourses() {
  if (courses.length === 0) return;
  courses = [];
  saveState();
  renderApp();
  showToast('Cleared all courses', 'danger');
}

// --- CUSTOM MODALS & TOAST POPUPS ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon select
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'danger') icon = '🗑️';
  
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  // Auto remove toast
  setTimeout(() => {
    toast.style.animation = 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3000);
}

function showDetailedTargetsToast(course) {
  const cie = calculateCourseCIE(course);
  const targetsInfo = getSEETargets(cie);
  
  if (!targetsInfo.possible) return;
  
  // Generate HTML table for the targets
  const targets = targetsInfo.targets;
  let rows = '';
  
  Object.keys(targets).forEach(grade => {
    const scoreVal = targets[grade];
    let styleClass = '';
    if (grade === 'O') styleClass = 'style="color: var(--color-success); font-weight: 700;"';
    if (scoreVal === 'Impossible') styleClass = 'style="color: var(--color-danger); opacity: 0.6;"';
    
    rows += `
      <tr>
        <td style="padding: 6px 12px; border-bottom: 1px solid var(--card-border); font-weight: 700;">${grade}</td>
        <td ${styleClass} style="padding: 6px 12px; border-bottom: 1px solid var(--card-border); text-align: right;">${scoreVal}</td>
      </tr>
    `;
  });
  
  // Create dialog content dynamically
  const container = document.createElement('div');
  container.className = 'custom-dialog-overlay';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.backgroundColor = 'rgba(0,0,0,0.6)';
  container.style.backdropFilter = 'blur(6px)';
  container.style.zIndex = '1000';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  
  container.innerHTML = `
    <div class="glass-card" style="max-width: 320px; width: 90%; animation: slideIn 0.3s ease-out; border-color: rgba(255,255,255,0.1);">
      <h3 style="font-family: var(--font-title); font-size: 1.15rem; margin-bottom: 8px; border-left: 3px solid var(--accent-primary); padding-left: 8px;">SEE Targets for "${course.name}"</h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px;">Minimum RAW marks out of 100 you need in the Semester End Exam (CIE: ${cie}/50).</p>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 20px;">
        <thead>
          <tr style="text-align: left; background: var(--bg-primary);">
            <th style="padding: 6px 12px; border-bottom: 1px solid var(--card-border);">Grade</th>
            <th style="padding: 6px 12px; border-bottom: 1px solid var(--card-border); text-align: right;">SEE Raw (100)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      
      <p style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 16px;">* Note: 40% (40 marks out of 100) is the minimum required passing marks in the SEE examination.</p>
      
      <button class="btn-primary w-full btn-close-dialog" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Close</button>
    </div>
  `;
  
  document.body.appendChild(container);
  
  container.querySelector('.btn-close-dialog').addEventListener('click', () => {
    container.remove();
  });
  
  container.addEventListener('click', (e) => {
    if (e.target === container) container.remove();
  });
}