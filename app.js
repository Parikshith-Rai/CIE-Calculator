/* ==========================================================================
   NMIT CIE & SGPA CALCULATOR - REACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

// --- STATE MANAGEMENT ---
let courses = [];
let savedSemesters = [];
let _deletedCourseBackup = null;
let _deleteCourseUndoTimer = null;
const DEFAULT_THEME = 'dark';
const SAVED_SEMESTERS_KEY = 'nmit_saved_semesters';

// --- ELEMENT SELECTORS ---
const themeToggle = document.getElementById('theme-toggle');
const btnFontDec = document.getElementById('btn-font-dec');
const btnFontReset = document.getElementById('btn-font-reset');
const btnFontInc = document.getElementById('btn-font-inc');
const btnInfo = document.getElementById('btn-info');
const guidelinesModal = document.getElementById('guidelines-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnAddNonIntegrated = document.getElementById('btn-add-non-integrated');
const btnAddIntegrated = document.getElementById('btn-add-integrated');
const btnAddLab = document.getElementById('btn-add-lab');
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
const btnPresetReset = document.getElementById('btn-preset-reset');

// Saved Semesters Selectors
const inputSemesterName = document.getElementById('input-semester-name');
const btnSaveSemester = document.getElementById('btn-save-semester');
const savedSemestersList = document.getElementById('saved-semesters-list');
const btnCompareSemesters = document.getElementById('btn-compare-semesters');
const comparisonModal = document.getElementById('comparison-modal');
const btnCloseCompare = document.getElementById('btn-close-compare');
const comparisonTbody = document.getElementById('comparison-tbody');

// Add Past Semester Selectors
const btnAddPastSemester = document.getElementById('btn-add-past-semester');
const pastSemesterModal = document.getElementById('past-semester-modal');
const btnClosePastModal = document.getElementById('btn-close-past-modal');
const btnSubmitPastSemester = document.getElementById('btn-submit-past-semester');
const pastSemNameInput = document.getElementById('past-sem-name');
const pastSemSgpaInput = document.getElementById('past-sem-sgpa');
const pastSemCreditsInput = document.getElementById('past-sem-credits');
const pastSemCieInput = document.getElementById('past-sem-cie');

const presetBranch = document.getElementById('preset-branch');
const presetSemester = document.getElementById('preset-semester');
const btnLoadPreset = document.getElementById('btn-load-preset');

// --- DEMO DATA (used only by the "Empty Demo" button, not the branch/semester preset system) ---
const DEMO_COURSES = [
  { name: "Engineering Mathematics-I", type: "non-integrated", credits: 4, la1: 8, la2: 8, mse1: 40, mse2: 42, lab: 0, seePredicted: 80 },
  { name: "Applied Physics", type: "integrated", credits: 4, la1: 0, la2: 0, mse1: 38, mse2: 40, lab: 18, seePredicted: 75 },
  { name: "Basic Electrical Engineering", type: "non-integrated", credits: 3, la1: 9, la2: 7, mse1: 35, mse2: 38, lab: 0, seePredicted: 70 },
  { name: "Elements of Civil Engineering", type: "non-integrated", credits: 3, la1: 7, la2: 8, mse1: 30, mse2: 32, lab: 0, seePredicted: 65 },
  { name: "Engineering Graphics", type: "non-integrated", credits: 3, la1: 8, la2: 9, mse1: 42, mse2: 40, lab: 0, seePredicted: 85 }
];

function loadDemoCourses() {
  courses = DEMO_COURSES.map((c, i) => ({
    ...c,
    id: `demo_${i}_${Date.now()}`
  }));
  saveState();
  renderApp();
  showToast('Loaded demo data', 'success');
}

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
    { name: "Mathematics with MATLAB", type: "lab", credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, viva: 0, finalLab: 0, seePredicted: 0 },
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
    { name: "Mathematics with MATLAB",                type: "lab",             credits: 1, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, viva: 0, finalLab: 0, seePredicted: 0 },    // MAT107 EXT=0
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
  CSE: {
    "1": _itSem1(),
    "2": _itSem2(),
    "3": [
      { name: "Discrete Mathematical Structures", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 88 },
      { name: "Data Structures & Applications", type: "integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 82 },
      { name: "Computer Organization & Arch.", type: "non-integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 72 },
      { name: "Analog & Digital Electronics", type: "integrated", credits: 4, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 68 },
      { name: "Object Oriented Programming", type: "integrated", credits: 3, la1: 0, la2: 0, mse1: 0, mse2: 0, lab: 0, seePredicted: 80 }
    ]
  },
  CSBS: { "1": _itSem1(), "2": _itSem2() },
  ISE:  { "1": _itSem1(), "2": _itSem2() },
  AIDS: { "1": _itSem1(), "2": _itSem2() },
  AIML: { "1": _itSem1(), "2": _itSem2() },
  RAI:  { "1": _nonItSem1(), "2": _itSem2() },
  EEE:  { "1": _itSem1(), "2": _eeeGroupSem2() },
  VLSI: { "1": _itSem1(), "2": _eeeGroupSem2() },
  ECE:  { "1": _itSem1(), "2": _eeeGroupSem2() },
  CE:   { "1": _nonItSem1(), "2": _civilMechAeroSem2("Chemistry for Civil Engineering") },
  ME:   { "1": _nonItSem1(), "2": _civilMechAeroSem2("Materials Chemistry and Energy Applications") },
  AE:   { "1": _nonItSem1(), "2": _civilMechAeroSem2("Materials Chemistry and Energy Applications") }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFontSize();
  loadState();
  renderApp();
  
  // Font Size controls
  btnFontDec.addEventListener('click', () => changeFontSize(-10));
  btnFontInc.addEventListener('click', () => changeFontSize(10));
  btnFontReset.addEventListener('click', () => changeFontSize(0));
  
  // Set up modal controls
  btnInfo.addEventListener('click', () => guidelinesModal.showModal());
  btnCloseModal.addEventListener('click', () => guidelinesModal.close());
  guidelinesModal.addEventListener('click', (e) => {
    if (e.target === guidelinesModal) guidelinesModal.close();
  });
  
  // Set up add buttons
  btnAddNonIntegrated.addEventListener('click', () => addCourse('non-integrated'));
  btnAddIntegrated.addEventListener('click', () => addCourse('integrated'));
  btnAddLab.addEventListener('click', () => addCourse('lab'));
  btnEmptyDemo.addEventListener('click', () => loadDemoCourses());
  
  // Presets controls
  btnLoadPreset.addEventListener('click', () => {
    const branch = presetBranch.value;
    const sem = presetSemester.value;
    if (!branch || !sem) {
      showToast('Please select both Branch and Semester', 'warning');
      return;
    }
    loadPreset(branch, sem);
  });
  
  btnPresetReset.addEventListener('click', clearAllCourses);
  
  // Saved Semesters controls
  btnSaveSemester.addEventListener('click', () => {
    const name = inputSemesterName.value.trim();
    if (name) {
      saveCurrentSemester(name);
      inputSemesterName.value = '';
    } else {
      showToast('Please enter a name for the semester', 'warning');
    }
  });
  
  btnCompareSemesters.addEventListener('click', openComparisonModal);
  btnCloseCompare.addEventListener('click', () => comparisonModal.close());
  comparisonModal.addEventListener('click', (e) => {
    if (e.target === comparisonModal) comparisonModal.close();
  });
  
  // Past Semester Modal controls
  btnAddPastSemester.addEventListener('click', () => pastSemesterModal.showModal());
  btnClosePastModal.addEventListener('click', () => pastSemesterModal.close());
  pastSemesterModal.addEventListener('click', (e) => {
    if (e.target === pastSemesterModal) pastSemesterModal.close();
  });
  
  btnSubmitPastSemester.addEventListener('click', () => {
    const name = pastSemNameInput.value.trim();
    const sgpa = parseFloat(pastSemSgpaInput.value);
    const credits = parseInt(pastSemCreditsInput.value);
    const avgCie = parseFloat(pastSemCieInput.value) || 0;
    
    if (!name || isNaN(sgpa) || isNaN(credits)) {
      showToast('Please enter Name, SGPA, and Total Credits', 'warning');
      return;
    }
    
    const newSavedSem = {
      id: 'sem_' + Date.now(),
      name: name,
      courses: [], // Empty for manual entries
      sgpa: sgpa,
      totalCredits: credits,
      avgCie: avgCie,
      isPast: true
    };
    
    savedSemesters.push(newSavedSem);
    saveState();
    renderSavedSemesters();
    
    // clear inputs
    pastSemNameInput.value = '';
    pastSemSgpaInput.value = '';
    pastSemCreditsInput.value = '';
    pastSemCieInput.value = '';
    
    pastSemesterModal.close();
    showToast(`Past Semester "${name}" added!`, 'success');
  });
  
  // PDF Export
  btnExportPdf.addEventListener('click', () => exportPDF());

  // Total users counter
  initUserCounter();
});

// --- TOTAL USERS COUNTER ---
// Uses the free CountAPI service (https://countapi.xyz) so the count is
// shared across every visitor, not just stored locally. A localStorage flag
// ensures each browser only increments the total once, so the number
// approximates unique users rather than total page loads.
const USER_COUNT_NAMESPACE = 'nmit-cie-hub';
const USER_COUNT_KEY = 'total-users';
const USER_COUNTED_FLAG = 'nmit_user_counted_v1';

function initUserCounter() {
  const valueEl = document.getElementById('user-count-value');
  if (!valueEl) return;

  const alreadyCounted = localStorage.getItem(USER_COUNTED_FLAG);
  const endpoint = alreadyCounted
    ? `https://api.countapi.xyz/get/${USER_COUNT_NAMESPACE}/${USER_COUNT_KEY}`
    : `https://api.countapi.xyz/hit/${USER_COUNT_NAMESPACE}/${USER_COUNT_KEY}`;

  fetch(endpoint)
    .then((res) => {
      if (!res.ok) throw new Error('Counter request failed');
      return res.json();
    })
    .then((data) => {
      if (typeof data.value === 'number') {
        valueEl.textContent = data.value.toLocaleString();
        if (!alreadyCounted) {
          localStorage.setItem(USER_COUNTED_FLAG, 'true');
        }
      }
    })
    .catch(() => {
      // Fail quietly - hide the badge if the counter service is unreachable
      const badge = document.getElementById('user-count-badge');
      if (badge) badge.style.display = 'none';
    });
}

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

// --- FONT SIZE MANAGEMENT ---
let currentFontSize = 100;

function initFontSize() {
  const savedSize = localStorage.getItem('nmit_font_size');
  if (savedSize) {
    currentFontSize = parseInt(savedSize, 10);
  }
  applyFontSize();
}

function applyFontSize() {
  document.documentElement.style.fontSize = currentFontSize + '%';
  localStorage.setItem('nmit_font_size', currentFontSize);
}

function changeFontSize(delta) {
  if (delta === 0) {
    currentFontSize = 100;
  } else {
    currentFontSize += delta;
    if (currentFontSize < 80) currentFontSize = 80;
    if (currentFontSize > 150) currentFontSize = 150;
  }
  applyFontSize();
  showToast(`Font Size: ${currentFontSize}%`, 'info');
}

// --- DATA PERSISTENCE ---
function saveState() {
  localStorage.setItem('nmit_cie_courses', JSON.stringify(courses));
  localStorage.setItem(SAVED_SEMESTERS_KEY, JSON.stringify(savedSemesters));
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
  
  const savedSems = localStorage.getItem(SAVED_SEMESTERS_KEY);
  if (savedSems) {
    try {
      savedSemesters = JSON.parse(savedSems);
    } catch (e) {
      savedSemesters = [];
    }
  }
}

// --- CALCULATION HELPER FUNCTIONS ---
function calculateCourseCIE(course) {
  if (course.type === 'lab') {
    // Lab-only: Viva (max 10) + Final Lab (max 40) = max 50
    const viva = course.viva || 0;
    const finalLab = course.finalLab || 0;
    return parseFloat((viva + finalLab).toFixed(1));
  }
  
  const mse1Scaled = (course.mse1 || 0) * 0.3;
  const mse2Scaled = (course.mse2 || 0) * 0.3;
  const la1Val = course.la1 || 0;
  const la2Val = course.la2 || 0;
  
  if (course.type === 'non-integrated') {
    return parseFloat((la1Val + la2Val + mse1Scaled + mse2Scaled).toFixed(1));
  } else {
    const theoryPart = la1Val + la2Val + mse1Scaled + mse2Scaled;
    const labVal = course.lab || 0;
    return parseFloat(((theoryPart * 0.6) + (labVal * 0.4)).toFixed(1));
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
    const isLab = course.type === 'lab';
    
    // Create card element
    const card = document.createElement('div');
    card.className = `glass-card course-card ${isIntegrated ? 'integrated' : ''} ${isLab ? 'lab-only' : ''}`;
    card.dataset.id = course.id;
    
    // Header section
    let headerHTML = `
      <div class="course-card-header">
        <div class="course-meta-inputs">
          <input type="text" class="input-course-name" value="${course.name}" placeholder="Enter Course Name" aria-label="Course Name">
          <div class="input-field-group">
            <input type="number" class="input-credits" value="${course.credits}" min="1" max="10" placeholder="Credits" title="Course Credits" aria-label="Course Credits">
          </div>
          <select class="course-type-select" title="Change course type" aria-label="Course Type">
            <option value="non-integrated" ${course.type === 'non-integrated' ? 'selected' : ''}>Theory (Non-Integrated)</option>
            <option value="integrated" ${course.type === 'integrated' ? 'selected' : ''}>Integrated (Lab)</option>
            <option value="lab" ${course.type === 'lab' ? 'selected' : ''}>Lab-Only Course</option>
          </select>
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
    if (isLab) {
      // Lab-only course: Viva (max 10) + Final Lab Assessment (max 40)
      bodyHTML = `
        <div class="course-card-body">
          <div class="marks-inputs-grid marks-inputs-grid-2">
            <div class="input-field-group">
              <label>Viva Marks <span class="label-max-tag">Max 10</span></label>
              <input type="number" class="input-mark input-viva" value="${course.viva || 0}" min="0" max="10" step="0.5" aria-label="Viva marks">
            </div>
            <div class="input-field-group">
              <label>Final Lab <span class="label-max-tag">Max 40</span></label>
              <input type="number" class="input-mark input-finallab" value="${course.finalLab || 0}" min="0" max="40" step="0.5" aria-label="Final lab marks">
            </div>
          </div>
          
          <div class="course-card-result">
            <span class="result-cie-value">${cie}</span>
            <span class="result-cie-label">CIE Score</span>
            <span class="status-badge ${status.class}">${status.label}</span>
          </div>
        </div>
      `;
    } else if (!isIntegrated) {
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
      if (inputEl.classList.contains('input-viva')) course.viva = val;
      if (inputEl.classList.contains('input-finallab')) course.finalLab = val;
      
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
  
  // Course type dropdown (switch integrated <-> non-integrated)
  const typeSelect = cardElement.querySelector('.course-type-select');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      switchCourseType(courseId, e.target.value);
    });
  }

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
    
    if (cie < 18) {
      ineligibleCount++;
    } else if (cie < 20) {
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
  const typeLabel = type === 'non-integrated' ? 'Theory' : type === 'lab' ? 'Lab' : 'Integrated';
  const newCourse = {
    id: 'course_' + Date.now(),
    name: `${typeLabel} Course ${courses.length + 1}`,
    type: type,
    credits: type === 'lab' ? 1 : 4,
    la1: type === 'non-integrated' ? 8 : 0,
    la2: type === 'non-integrated' ? 8 : 0,
    mse1: type === 'lab' ? 0 : 40,
    mse2: type === 'lab' ? 0 : 40,
    lab: type === 'integrated' ? 16 : 0,
    viva: type === 'lab' ? 0 : 0,
    finalLab: type === 'lab' ? 0 : 0,
    seePredicted: type === 'lab' ? 0 : 80
  };
  
  courses.push(newCourse);
  saveState();
  renderApp();
  showToast(`Added new ${typeLabel} course`, 'success');
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

function switchCourseType(id, newType) {
  const course = courses.find(c => c.id === id);
  if (!course || course.type === newType) return;

  course.type = newType;

  // Reset fields that don't apply to new type
  if (newType === 'non-integrated') {
    course.la1 = course.la1 || 8;
    course.la2 = course.la2 || 8;
    course.lab = 0;
    course.viva = 0;
    course.finalLab = 0;
  } else if (newType === 'integrated') {
    course.la1 = 0;
    course.la2 = 0;
    course.lab = course.lab || 16;
    course.viva = 0;
    course.finalLab = 0;
  } else if (newType === 'lab') {
    course.la1 = 0;
    course.la2 = 0;
    course.mse1 = 0;
    course.mse2 = 0;
    course.lab = 0;
    course.viva = course.viva || 0;
    course.finalLab = course.finalLab || 0;
  }

  saveState();
  renderApp();
  const typeLabel = newType === 'integrated' ? 'Integrated' : newType === 'lab' ? 'Lab-Only' : 'Non-Integrated';
  showToast(`Switched "${course.name}" to ${typeLabel}`, 'success');
}

function deleteCourse(id) {
  const index = courses.findIndex(c => c.id === id);
  if (index === -1) return;
  
  const deletedCourse = courses[index];
  _deletedCourseBackup = { course: JSON.parse(JSON.stringify(deletedCourse)), index: index };
  
  courses.splice(index, 1);
  saveState();
  renderApp();
  showUndoDeleteToast(`Deleted "${deletedCourse.name}"`);
}

function loadPreset(branch, semester) {
  const branchData = PRESETS[branch];
  if (!branchData) {
    showToast(`No preset available for ${branch} yet.`, 'warning');
    return;
  }
  const preset = branchData[semester];
  if (!preset) {
    showToast(`No preset available for ${branch} - Semester ${semester} yet.`, 'warning');
    return;
  }
  
  courses = preset.map((c, i) => ({
    ...c,
    id: `preset_${branch}_${semester}_${i}_${Date.now()}`
  }));
  
  saveState();
  renderApp();
  showToast(`Loaded ${branch} Semester ${semester} preset successfully`, 'success');
}

function clearAllCourses() {
  if (courses.length === 0) return;
  courses = [];
  saveState();
  renderApp();
  showToast('Cleared all courses', 'danger');
}

// --- PDF EXPORT ---
function exportPDF() {
  if (courses.length === 0) {
    showToast('Add some courses before exporting', 'warning');
    return;
  }

  // ── Gather all data ──────────────────────────────────────────────────────
  let totalGradePoints = 0, totalCredits = 0, ineligibleCount = 0;
  const rows = courses.map(course => {
    const cie        = calculateCourseCIE(course);
    const eligible   = cie >= 20;
    const predictSEE = course.seePredicted ?? 80;
    const finalScore = eligible ? Math.min(100, Math.round(cie + predictSEE / 2)) : 0;
    const gradeObj   = eligible ? getGradePoints(finalScore) : { grade: 'F', points: 0 };
    const credits    = parseInt(course.credits) || 0;

    if (!eligible) ineligibleCount++;
    totalGradePoints += gradeObj.points * credits;
    totalCredits     += credits;

    return { course, cie, eligible, predictSEE, finalScore, gradeObj, credits };
  });

  const sgpa    = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
  const avgCie  = (rows.reduce((s, r) => s + r.cie, 0) / rows.length).toFixed(1);
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Grade colour map ─────────────────────────────────────────────────────
  const gradeColor = {
    O:'#16a34a', 'A+':'#2563eb', A:'#0891b2',
    'B+':'#7c3aed', B:'#9333ea', C:'#d97706', P:'#ea580c', F:'#dc2626'
  };

  // ── Build course rows HTML ───────────────────────────────────────────────
  const rowsHTML = rows.map((r, idx) => {
    const isIntg = r.course.type === 'integrated';
    const gc     = gradeColor[r.gradeObj.grade] || '#6b7280';

    // marks detail string
    let marksDetail = '';
    if (isIntg) {
      marksDetail = `MSE1: ${r.course.mse1||0}/50 &nbsp;|&nbsp; MSE2: ${r.course.mse2||0}/50 &nbsp;|&nbsp; Lab: ${r.course.lab||0}/50`;
    } else {
      marksDetail = `LA1: ${r.course.la1||0}/10 &nbsp;|&nbsp; LA2: ${r.course.la2||0}/10 &nbsp;|&nbsp; MSE1: ${r.course.mse1||0}/50 &nbsp;|&nbsp; MSE2: ${r.course.mse2||0}/50`;
    }

    return `
      <tr style="background:${idx%2===0?'#f9fafb':'#ffffff'}">
        <td style="padding:10px 12px;font-weight:500;color:#111827">${idx+1}. ${r.course.name||'Untitled'}</td>
        <td style="padding:10px 12px;text-align:center">
          <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${isIntg?'#ede9fe':'#e0f2fe'};color:${isIntg?'#6d28d9':'#0369a1'}">
            ${isIntg ? 'Integrated' : 'Theory'}
          </span>
        </td>
        <td style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280">${marksDetail}</td>
        <td style="padding:10px 12px;text-align:center;font-weight:700;color:${r.eligible?'#111827':'#dc2626'}">${r.cie}/50</td>
        <td style="padding:10px 12px;text-align:center">
          <span style="padding:2px 8px;border-radius:20px;font-size:11px;background:${r.eligible?'#dcfce7':'#fee2e2'};color:${r.eligible?'#15803d':'#dc2626'}">
            ${r.eligible ? 'Eligible' : 'Ineligible'}
          </span>
        </td>
        <td style="padding:10px 12px;text-align:center;color:#6b7280">${r.credits}</td>
        <td style="padding:10px 12px;text-align:center;color:#6b7280">${r.predictSEE}/100</td>
        <td style="padding:10px 12px;text-align:center;font-weight:700;color:${gc}">
          ${r.gradeObj.grade} (${r.gradeObj.points})
        </td>
      </tr>`;
  }).join('');

  // ── SGPA colour ──────────────────────────────────────────────────────────
  const sgpaNum = parseFloat(sgpa);
  const sgpaClr = sgpaNum >= 8.5 ? '#16a34a' : sgpaNum >= 7 ? '#2563eb' : sgpaNum >= 5.5 ? '#d97706' : '#dc2626';

  // ── Full HTML document ───────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NMIT CIE Report — ${dateStr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; color: #111827; }
    .page { max-width: 900px; margin: 0 auto; background: #fff; padding: 40px 36px 48px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #6d28d9; margin-bottom: 28px; }
    .header-left h1 { font-size: 24px; font-weight: 800; color: #6d28d9; letter-spacing: -0.5px; }
    .header-left p  { font-size: 13px; color: #6b7280; margin-top: 3px; }
    .header-right   { text-align: right; font-size: 12px; color: #6b7280; }
    .header-right strong { display: block; font-size: 13px; color: #111827; }

    /* Summary cards */
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
    .stat-box { border-radius: 10px; padding: 14px 16px; }
    .stat-box .val { font-size: 28px; font-weight: 800; line-height: 1; }
    .stat-box .lbl { font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Table */
    .section-title { font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 28px; }
    thead tr { background: #6d28d9; color: #fff; }
    thead th { padding: 10px 12px; text-align: center; font-weight: 600; font-size: 12px; letter-spacing: 0.3px; }
    thead th:first-child { text-align: left; }
    tbody tr:last-child td { border-bottom: none; }
    td { border-bottom: 1px solid #e5e7eb; }

    /* Grade key */
    .grade-key { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
    .grade-pill { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }

    /* Footer */
    .footer { border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }

    @media print {
      body { background: #fff; }
      .page { padding: 24px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>NMIT CIE Hub</h1>
      <p>Nitte Meenakshi Institute of Technology — CIE &amp; SGPA Report</p>
    </div>
    <div class="header-right">
      <strong>${dateStr}</strong>
      Generated by NMIT CIE Hub
    </div>
  </div>

  <!-- Summary -->
  <div class="summary">
    <div class="stat-box" style="background:#f5f3ff">
      <div class="val" style="color:${sgpaClr}">${sgpa}</div>
      <div class="lbl">Projected SGPA</div>
    </div>
    <div class="stat-box" style="background:#f0fdf4">
      <div class="val" style="color:#16a34a">${avgCie}</div>
      <div class="lbl">Avg CIE Marks</div>
    </div>
    <div class="stat-box" style="background:#eff6ff">
      <div class="val" style="color:#2563eb">${totalCredits}</div>
      <div class="lbl">Total Credits</div>
    </div>
    <div class="stat-box" style="background:${ineligibleCount>0?'#fef2f2':'#f0fdf4'}">
      <div class="val" style="color:${ineligibleCount>0?'#dc2626':'#16a34a'}">${ineligibleCount > 0 ? ineligibleCount + ' ⚠' : '✓ All'}</div>
      <div class="lbl">${ineligibleCount>0?'Ineligible Courses':'SEE Eligible'}</div>
    </div>
  </div>

  <!-- Course Table -->
  <div class="section-title">Course-wise Breakdown</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;width:22%">Course</th>
        <th>Type</th>
        <th>Marks Entered</th>
        <th>CIE/50</th>
        <th>SEE Status</th>
        <th>Credits</th>
        <th>SEE (pred.)</th>
        <th>Grade (GP)</th>
      </tr>
    </thead>
    <tbody>${rowsHTML}</tbody>
  </table>

  <!-- Grade Key -->
  <div class="section-title">Grade Scale Reference</div>
  <div class="grade-key">
    ${Object.entries(gradeColor).map(([g,c])=>`<span class="grade-pill" style="background:${c}22;color:${c}">${g}</span>`).join('')}
    <span style="font-size:11px;color:#6b7280;align-self:center;margin-left:4px">GP = Grade Points on 10-point scale &nbsp;|&nbsp; Min CIE = 20/50 for SEE eligibility &nbsp;|&nbsp; Min SEE = 40/100 to pass</span>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>NMIT CIE Hub &mdash; nmit.ac.in</span>
    <span>This report is auto-generated and for reference only.</span>
  </div>

</div>
<script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  // ── Open in new tab and trigger print ────────────────────────────────────
  const win = window.open('', '_blank');
  if (!win) {
    showToast('Pop-up blocked — please allow pop-ups and try again', 'warning');
    return;
  }
  win.document.write(html);
  win.document.close();
  showToast('Report ready — save as PDF from the print dialog', 'success');
}

// --- SAVED SEMESTERS OPERATIONS ---

function saveCurrentSemester(name) {
  if (courses.length === 0) {
    showToast('Add some courses before saving.', 'warning');
    return;
  }
  
  let totalGradePoints = 0;
  let totalCredits = 0;
  let totalCieVal = 0;
  
  courses.forEach(course => {
    const cie = calculateCourseCIE(course);
    totalCieVal += cie * course.credits;
    if (cie >= 20) {
      const predictedSEE = course.seePredicted !== undefined ? course.seePredicted : 80;
      const finalScore = Math.min(100, Math.round(cie + (predictedSEE / 2)));
      totalGradePoints += getGradePoints(finalScore).points * course.credits;
    }
    totalCredits += course.credits;
  });
  
  const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
  const avgCie = totalCredits > 0 ? (totalCieVal / totalCredits) : 0;
  
  const newSavedSem = {
    id: 'sem_' + Date.now(),
    name: name,
    courses: JSON.parse(JSON.stringify(courses)),
    sgpa: parseFloat(sgpa.toFixed(2)),
    totalCredits: totalCredits,
    avgCie: parseFloat(avgCie.toFixed(1))
  };
  
  savedSemesters.push(newSavedSem);
  saveState();
  renderSavedSemesters();
  showToast(`Semester "${name}" saved!`, 'success');
}

function loadSavedSemester(id) {
  const sem = savedSemesters.find(s => s.id === id);
  if (!sem) return;
  
  // Backup current for undo before overwriting
  if (courses.length > 0) {
    _deletedCoursesBackup = JSON.parse(JSON.stringify(courses));
  }
  
  courses = JSON.parse(JSON.stringify(sem.courses));
  saveState();
  renderApp();
  
  // We use the undo logic if they overwrote existing courses
  if (_deletedCoursesBackup) {
    showUndoLoadToast(`Loaded "${sem.name}"`);
  } else {
    showToast(`Loaded "${sem.name}"`, 'success');
  }
}

function deleteSavedSemester(id) {
  savedSemesters = savedSemesters.filter(s => s.id !== id);
  saveState();
  renderSavedSemesters();
  showToast('Saved semester deleted', 'danger');
}

function renderSavedSemesters() {
  savedSemestersList.innerHTML = '';
  
  if (savedSemesters.length === 0) {
    savedSemestersList.innerHTML = '<p style="text-align:center; color:var(--text-secondary); font-size:0.85rem; margin-top:0.5rem;">No saved semesters.</p>';
    btnCompareSemesters.disabled = true;
    return;
  }
  
  btnCompareSemesters.disabled = savedSemesters.length < 2;
  
  savedSemesters.forEach(sem => {
    const el = document.createElement('div');
    el.className = 'saved-semester-item';
    el.innerHTML = `
      <div class="saved-semester-info">
        <span class="saved-semester-name">${sem.name}</span>
        <span class="saved-semester-stats">SGPA: ${sem.sgpa} | CIE: ${sem.avgCie}</span>
      </div>
      <div class="saved-semester-actions">
        ${sem.isPast || sem.courses.length === 0 ? '' : `
        <button class="btn-icon" title="Load" onclick="loadSavedSemester('${sem.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        `}
        <button class="btn-icon btn-delete" title="Delete" onclick="deleteSavedSemester('${sem.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    savedSemestersList.appendChild(el);
  });
}

function openComparisonModal() {
  if (savedSemesters.length < 2) return;
  
  comparisonTbody.innerHTML = '';
  
  // Create a row for each saved semester
  savedSemesters.forEach(sem => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700;">${sem.name}</td>
      <td>${sem.totalCredits}</td>
      <td>${sem.avgCie} / 50</td>
      <td style="font-weight: 700; color: var(--accent-primary);">${sem.sgpa}</td>
    `;
    comparisonTbody.appendChild(tr);
  });
  
  comparisonModal.showModal();
}

function showUndoLoadToast(msg) {
  // Same logic as showUndoClearToast, but different text
  const existing = document.querySelector('.toast-undo');
  if (existing) existing.remove();
  if (_undoTimer) clearTimeout(_undoTimer);
  
  const toast = document.createElement('div');
  toast.className = 'toast toast-warning toast-undo';
  toast.innerHTML = `
    <span>🔄</span>
    <span style="flex: 1;">${msg}</span>
    <button class="toast-undo-btn" id="btn-undo-load">Undo</button>
    <div class="toast-progress"></div>
  `;
  toastContainer.appendChild(toast);
  
  const progressBar = toast.querySelector('.toast-progress');
  requestAnimationFrame(() => {
    progressBar.style.transition = 'width 5s linear';
    progressBar.style.width = '0%';
  });
  
  toast.querySelector('#btn-undo-load').addEventListener('click', () => {
    if (_deletedCoursesBackup) {
      courses = _deletedCoursesBackup;
      _deletedCoursesBackup = null;
      saveState();
      renderApp();
      showToast('Courses restored!', 'success');
    }
    clearTimeout(_undoTimer);
    toast.remove();
  });
  
  _undoTimer = setTimeout(() => {
    toast.style.animation = 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => toast.remove(), 350);
    _deletedCoursesBackup = null;
  }, 5000);
}

function showUndoDeleteToast(msg) {
  const existing = document.querySelector('.toast-undo');
  if (existing) existing.remove();
  if (_deleteCourseUndoTimer) clearTimeout(_deleteCourseUndoTimer);
  
  const toast = document.createElement('div');
  toast.className = 'toast toast-warning toast-undo';
  toast.innerHTML = `
    <span>🗑️</span>
    <span style="flex: 1;">${msg}</span>
    <button class="toast-undo-btn" id="btn-undo-delete">Undo</button>
    <div class="toast-progress"></div>
  `;
  toastContainer.appendChild(toast);
  
  const progressBar = toast.querySelector('.toast-progress');
  requestAnimationFrame(() => {
    progressBar.style.transition = 'width 7s linear';
    progressBar.style.width = '0%';
  });
  
  toast.querySelector('#btn-undo-delete').addEventListener('click', () => {
    if (_deletedCourseBackup) {
      const { course, index } = _deletedCourseBackup;
      const insertAt = Math.min(index, courses.length);
      courses.splice(insertAt, 0, course);
      _deletedCourseBackup = null;
      saveState();
      renderApp();
      showToast('Course restored!', 'success');
    }
    clearTimeout(_deleteCourseUndoTimer);
    toast.remove();
  });
  
  _deleteCourseUndoTimer = setTimeout(() => {
    toast.style.animation = 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => toast.remove(), 350);
    _deletedCourseBackup = null;
  }, 7000);
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