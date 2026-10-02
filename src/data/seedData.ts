import { PreparationWeek, StudyDay, BenchmarkTest, WeeklyAiReport, SystemAnalytics } from '../types';

export const CANONICAL_CURRICULUM = {
  Physics: [
    { chapter: 'Rotational Motion', concepts: ['Torque & Angular Momentum', 'Rolling Motion Without Slipping', 'Moment of Inertia', 'Conservation of Angular Momentum'] },
    { chapter: 'Electrostatics', concepts: ['Electric Field & Potential', 'Gauss Law Applications', 'Capacitance & Dielectrics', 'Dipole in Uniform Field'] },
    { chapter: 'Thermodynamics & KTG', concepts: ['First Law & Work Done', 'Carnot Engine & Efficiency', 'Degrees of Freedom', 'Adiabatic Processes'] },
    { chapter: 'Current Electricity', concepts: ['Kirchhoff Laws', 'RC Circuits Transients', 'Potentiometer & Meter Bridge', 'Wheatstone Bridge'] },
    { chapter: 'Ray & Wave Optics', concepts: ['Total Internal Reflection', 'Lens Maker Formula', 'Young Double Slit Experiment', 'Diffraction & Polarisation'] }
  ],
  Chemistry: [
    { chapter: 'Chemical Bonding & Molecular Structure', concepts: ['VSEPR Theory & Hybridisation', 'Molecular Orbital Theory', 'Dipole Moments & Resonance', 'Hydrogen Bonding'] },
    { chapter: 'Organic Alcohols, Phenols & Ethers', concepts: ['Nucleophilic Substitution Mechanisms', 'Acidic Nature of Phenols', 'Williamson Ether Synthesis', 'Dehydration of Alcohols'] },
    { chapter: 'Thermodynamics & Energetics', concepts: ['Hess Law & Enthalpy of Reaction', 'Gibbs Free Energy & Spontaneity', 'Entropy Changes in Closed Systems', 'Thermochemical Equations'] },
    { chapter: 'Coordination Compounds', concepts: ['Crystal Field Splitting Theory', 'Isomerism in Complexes', 'Valence Bond Theory & Magnetic Moments', 'Nomenclature & Chelation'] },
    { chapter: 'Electrochemistry', concepts: ['Nernst Equation & Cell Potential', 'Faraday Laws of Electrolysis', 'Kohlrausch Law & Conductance', 'Batteries & Fuel Cells'] }
  ],
  Mathematics: [
    { chapter: 'Integral Calculus (Indefinite & Definite)', concepts: ['Integration by Parts & Substitution', 'Definite Integrals as Limit of Sum', 'Leibniz Integral Rule', 'Properties of Definite Integrals'] },
    { chapter: 'Coordinate Geometry (Conics & Lines)', concepts: ['Parabola Tangents & Normals', 'Ellipse & Hyperbola Eccentricity', 'Pair of Straight Lines', 'Circle Chord of Contact'] },
    { chapter: 'Differential Equations', concepts: ['First Order Linear DE', 'Variable Separable Form', 'Homogeneous Equations', 'Orthogonal Trajectories'] },
    { chapter: 'Vectors & 3D Geometry', concepts: ['Shortest Distance Between Skew Lines', 'Vector Triple Product', 'Equation of Plane in 3D', 'Angle Between Planes & Lines'] },
    { chapter: 'Probability & Statistics', concepts: ['Bayes Theorem & Conditional Probability', 'Binomial Distribution & Expectation', 'Total Probability Law', 'Variance & Standard Deviation'] }
  ]
};

// Authentic sample handwritten notebook photo presets for demo / testing
export const NOTEBOOK_PHOTO_PRESETS = [
  {
    id: 'photo_rot_elec',
    name: 'Oct 01 - Rotational Motion & Electrostatics Error Sheet',
    previewSvgColor: 'from-amber-900/40 to-slate-900',
    title: 'Notebook Page 42: Timed Session Analysis',
    rawStudentNotes: [
      'Q.14 (Physics / Rotational Motion) - Rolling on rough incline: Forgot that friction provides torque about CM while acting up the plane. Wrote a = g sinθ without (1 + I/mR²). Lost 5.5 min on wrong quadratic.',
      'Q.28 (Physics / Electrostatics) - Concentric shells with dielectric: Correctly identified Gauss Law formula, but assumed field inside inner conductor was non-zero. Confused surface charge density distribution.',
      'Q.39 (Mathematics / Integration) - Definite integral with King Rule: Spent 9 mins trying substitution before realizing King property f(a+b-x) gives 2I immediately. Selection error: should have abandoned after 2 mins.'
    ],
    sampleExtracted: [
      {
        id: 'err_rot_01',
        subject: 'Physics' as const,
        chapter: 'Rotational Motion',
        concept: 'Rolling Motion Without Slipping',
        errorType: 'application' as const,
        description: 'Failed to incorporate rolling factor (1 + I/mR²) in incline acceleration equation.',
        whyItHappened: 'Attempted to use pure translational equation under time pressure without drawing free-body diagram.',
        correctUnderstanding: 'For unconstrained rolling down incline, torque about CM comes from static friction: a = g sinθ / (1 + I/mR²).',
        timeLostSeconds: 330,
        confidenceLevel: 'wrong_uncertain' as const
      },
      {
        id: 'err_elec_01',
        subject: 'Physics' as const,
        chapter: 'Electrostatics',
        concept: 'Gauss Law Applications',
        errorType: 'concept' as const,
        description: 'Assumed interior of solid metallic conductor has non-zero electric field in electrostatic equilibrium.',
        whyItHappened: 'Confused dielectric slab behavior with isolated metal sphere under external induction.',
        correctUnderstanding: 'In electrostatic equilibrium, E = 0 everywhere inside bulk conductor regardless of surrounding charges.',
        timeLostSeconds: 240,
        confidenceLevel: 'wrong_confident' as const
      },
      {
        id: 'err_math_01',
        subject: 'Mathematics' as const,
        chapter: 'Integral Calculus (Indefinite & Definite)',
        concept: 'Properties of Definite Integrals',
        errorType: 'selection' as const,
        description: 'Spent 9 minutes stubbornly integrating algebraic fractions instead of applying King Rule property.',
        whyItHappened: 'Sunk cost fallacy: thought answer was 2 lines away and refused to abandon timed question.',
        correctUnderstanding: 'Always test King rule ∫[a to b] f(x)dx = ∫[a to b] f(a+b-x)dx first if limits add up to π or clean integers. Cap problem at 2.5 min.',
        timeLostSeconds: 540,
        confidenceLevel: 'wrong_confident' as const
      }
    ]
  },
  {
    id: 'photo_chem_coord',
    name: 'Oct 02 - Organic Substitution & Coordination Compounds',
    previewSvgColor: 'from-emerald-900/40 to-slate-900',
    title: 'Notebook Page 43: Morning Error Log',
    rawStudentNotes: [
      'Q.8 (Chemistry / Coordination Compounds) - Octahedral [Co(NH3)4Cl2]+: counted trans isomers but forgot optical isomerism of cis isomer! Cis form has no plane of symmetry, so d- and l- enantiomers exist.',
      'Q.21 (Chemistry / Organic Alcohols) - Dehydration with conc. H2SO4: Expected 1° carbocation elimination, missed hydride shift causing rearrangement to 3° stable carbocation.'
    ],
    sampleExtracted: [
      {
        id: 'err_coord_01',
        subject: 'Chemistry' as const,
        chapter: 'Coordination Compounds',
        concept: 'Isomerism in Complexes',
        errorType: 'concept' as const,
        description: 'Missed optical activity of cis-[M(a)4(b)2] vs optically inactive trans isomer.',
        whyItHappened: 'Only searched for geometrical cis/trans and neglected chiral non-superimposable mirror image check.',
        correctUnderstanding: 'Cis isomer lacks inversion center and mirror plane; thus it exhibits optical enantiomerism.',
        timeLostSeconds: 210,
        confidenceLevel: 'wrong_uncertain' as const
      },
      {
        id: 'err_org_01',
        subject: 'Chemistry' as const,
        chapter: 'Organic Alcohols, Phenols & Ethers',
        concept: 'Nucleophilic Substitution Mechanisms',
        errorType: 'application' as const,
        description: 'Did not check for hydride shift rearrangement in intermediate carbocation.',
        whyItHappened: 'Rushed through mechanism without writing carbocation stability comparison (1° vs 3°).',
        correctUnderstanding: 'Secondary carbocation adjacent to tertiary carbon will undergo rapid 1,2-hydride shift to form stable 3° intermediate.',
        timeLostSeconds: 180,
        confidenceLevel: 'wrong_uncertain' as const
      }
    ]
  }
];

export const INITIAL_WEEKS: PreparationWeek[] = [
  {
    id: '2026-W38',
    title: 'Cycle 38 (JEE Heavy Foundation)',
    startDate: '2026-09-15',
    endDate: '2026-09-21',
    jeeDays: 4,
    cetDays: 1,
    allocationRatio: '4:1',
    benchmarkExam: 'JEE',
    targetWeeklyHours: 32,
    status: 'completed',
    benchmark: {
      id: 'bm_w38',
      weekId: '2026-W38',
      date: '2026-09-21',
      examType: 'JEE',
      totalQuestions: 75,
      attempted: 58,
      correct: 44,
      wrong: 14,
      skipped: 17,
      score: 162,
      maximumScore: 300,
      durationMinutes: 180,
      notes: 'Initial baseline test. Physics scored 62/100, Math was bottlenecked on time.',
      subjectBreakdown: [
        { subject: 'Physics', attempted: 21, correct: 17, wrong: 4, skipped: 4, score: 64, maxScore: 100, accuracy: 81.0 },
        { subject: 'Chemistry', attempted: 22, correct: 18, wrong: 4, skipped: 3, score: 68, maxScore: 100, accuracy: 81.8 },
        { subject: 'Mathematics', attempted: 15, correct: 9, wrong: 6, skipped: 10, score: 30, maxScore: 100, accuracy: 60.0 }
      ]
    }
  },
  {
    id: '2026-W39',
    title: 'Cycle 39 (CET Speed & Throughput)',
    startDate: '2026-09-22',
    endDate: '2026-09-28',
    jeeDays: 2,
    cetDays: 3,
    allocationRatio: '2:3',
    benchmarkExam: 'CET',
    targetWeeklyHours: 30,
    status: 'completed',
    benchmark: {
      id: 'bm_w39',
      weekId: '2026-W39',
      date: '2026-09-28',
      examType: 'CET',
      totalQuestions: 150,
      attempted: 134,
      correct: 112,
      wrong: 22,
      skipped: 16,
      score: 148,
      maximumScore: 200,
      durationMinutes: 180,
      notes: 'CET speed intervention showed noticeable improvement in question throughput.',
      subjectBreakdown: [
        { subject: 'Physics', attempted: 45, correct: 38, wrong: 7, skipped: 5, score: 38, maxScore: 50, accuracy: 84.4 },
        { subject: 'Chemistry', attempted: 48, correct: 42, wrong: 6, skipped: 2, score: 42, maxScore: 50, accuracy: 87.5 },
        { subject: 'Mathematics', attempted: 41, correct: 32, wrong: 9, skipped: 9, score: 68, maxScore: 100, accuracy: 78.0 }
      ]
    }
  },
  {
    id: '2026-W40',
    title: 'Cycle 40 (Balanced Adaptive Intervention)',
    startDate: '2026-09-29',
    endDate: '2026-10-05',
    jeeDays: 3,
    cetDays: 2,
    allocationRatio: '3:2',
    benchmarkExam: 'JEE',
    targetWeeklyHours: 30,
    status: 'active'
  }
];

export const INITIAL_STUDY_DAYS: StudyDay[] = [
  {
    id: 'day_w40_d1',
    weekId: '2026-W40',
    date: '2026-09-29',
    examFocus: 'JEE',
    dayType: 'NORMAL',
    context: 'Full focus on Rotational Motion & Definite Integrals problem set.',
    targetHours: 6.0,
    availableHours: 6.0,
    actualHours: 5.5,
    testingHours: 3.0,
    analysisHours: 1.5,
    otherStudyHours: 1.0,
    questionsAttempted: 52,
    questionsCorrect: 38,
    questionsWrong: 11,
    questionsSkipped: 3,
    guessedQuestions: 4,
    notebookImages: ['photo_rot_elec'],
    errorRecords: [
      {
        id: 'err_seed_1',
        studyDayId: 'day_w40_d1',
        subject: 'Physics',
        chapter: 'Rotational Motion',
        concept: 'Rolling Motion Without Slipping',
        errorType: 'application',
        description: 'Failed to factor rotational inertia penalty into pure rolling incline motion.',
        whyItHappened: 'Treated cylinder as point mass sliding down smooth incline.',
        correctUnderstanding: 'Rolling condition requires torque equation α = a/R and static friction torque.',
        timeLostSeconds: 330,
        confidenceLevel: 'wrong_uncertain',
        sourceImageName: 'Rotational Motion Analysis p.42',
        createdAt: '2026-09-29T19:30:00Z'
      },
      {
        id: 'err_seed_2',
        studyDayId: 'day_w40_d1',
        subject: 'Mathematics',
        chapter: 'Integral Calculus (Indefinite & Definite)',
        concept: 'Properties of Definite Integrals',
        errorType: 'selection',
        description: 'Stubbornly spent 9 minutes on high-power trigonometric integral.',
        whyItHappened: 'Refused to pivot to King Rule f(a+b-x). Ego-driven calculation.',
        correctUnderstanding: 'If integral algebraic substitution takes > 2 minutes with no progress, immediately test symmetry properties or skip.',
        timeLostSeconds: 540,
        confidenceLevel: 'wrong_confident',
        sourceImageName: 'Definite Integrals Sheet p.42',
        createdAt: '2026-09-29T20:15:00Z'
      }
    ],
    feedbackLoopEnabledOnSubmit: true,
    processingStatus: 'completed',
    createdAt: '2026-09-29T21:00:00Z'
  },
  {
    id: 'day_w40_d2',
    weekId: '2026-W40',
    date: '2026-09-30',
    examFocus: 'JEE',
    dayType: 'SCHOOL_HEAVY',
    context: 'Heavy school schedule; lab practicals took 3 hours. Adjusted study window.',
    targetHours: 6.0,
    availableHours: 3.5,
    actualHours: 3.3,
    testingHours: 2.0,
    analysisHours: 1.0,
    otherStudyHours: 0.3,
    questionsAttempted: 34,
    questionsCorrect: 27,
    questionsWrong: 5,
    questionsSkipped: 2,
    guessedQuestions: 2,
    notebookImages: ['photo_rot_elec'],
    errorRecords: [
      {
        id: 'err_seed_3',
        studyDayId: 'day_w40_d2',
        subject: 'Physics',
        chapter: 'Electrostatics',
        concept: 'Gauss Law Applications',
        errorType: 'concept',
        description: 'Assumed non-zero field within conductor cavity with internal charge.',
        whyItHappened: 'Forgot that inner surface of cavity acquires equal and opposite induced charge.',
        correctUnderstanding: 'Total charge enclosed by Gaussian surface inside conductor metal must be 0.',
        timeLostSeconds: 240,
        confidenceLevel: 'wrong_confident',
        sourceImageName: 'Electrostatics Notebook p.42',
        createdAt: '2026-09-30T20:00:00Z'
      },
      {
        id: 'err_seed_4',
        studyDayId: 'day_w40_d2',
        subject: 'Mathematics',
        chapter: 'Coordinate Geometry (Conics & Lines)',
        concept: 'Parabola Tangents & Normals',
        errorType: 'execution',
        description: 'Sign error in equation of normal y = mx - 2am - am^3 (used +2am).',
        whyItHappened: 'Arithmetic haste in timed drill.',
        correctUnderstanding: 'Parametric normal to y² = 4ax at (am², 2am) is y + tx = 2at + at³.',
        timeLostSeconds: 150,
        confidenceLevel: 'correct_uncertain',
        sourceImageName: 'Conics drill page',
        createdAt: '2026-09-30T20:45:00Z'
      }
    ],
    feedbackLoopEnabledOnSubmit: true,
    processingStatus: 'completed',
    createdAt: '2026-09-30T21:30:00Z'
  },
  {
    id: 'day_w40_d3',
    weekId: '2026-W40',
    date: '2026-10-01',
    examFocus: 'CET',
    dayType: 'NORMAL',
    context: 'CET rapid throughput drill. Chemistry & Physics fast-response rounds.',
    targetHours: 6.0,
    availableHours: 5.5,
    actualHours: 5.2,
    testingHours: 3.5,
    analysisHours: 1.2,
    otherStudyHours: 0.5,
    questionsAttempted: 88,
    questionsCorrect: 73,
    questionsWrong: 12,
    questionsSkipped: 3,
    guessedQuestions: 6,
    notebookImages: ['photo_chem_coord'],
    errorRecords: [
      {
        id: 'err_seed_5',
        studyDayId: 'day_w40_d3',
        subject: 'Chemistry',
        chapter: 'Coordination Compounds',
        concept: 'Isomerism in Complexes',
        errorType: 'concept',
        description: 'Failed to recognize optical activity in cis-octahedral complex without plane of symmetry.',
        whyItHappened: 'Assumed only bidentate chelates have optical isomers.',
        correctUnderstanding: 'Cis-[M(AA)2B2] and cis-[MA4B2] type systems need 3D symmetry analysis; lack of Sn axis gives chirality.',
        timeLostSeconds: 190,
        confidenceLevel: 'wrong_uncertain',
        sourceImageName: 'Chemistry Note p.43',
        createdAt: '2026-10-01T20:10:00Z'
      },
      {
        id: 'err_seed_6',
        studyDayId: 'day_w40_d3',
        subject: 'Chemistry',
        chapter: 'Organic Alcohols, Phenols & Ethers',
        concept: 'Nucleophilic Substitution Mechanisms',
        errorType: 'application',
        description: 'Neglected Wagner-Meerwein carbocation rearrangement during acid dehydration of 2-butanol.',
        whyItHappened: 'Rushed direct elimination without checking carbocation intermediate rearrangement.',
        correctUnderstanding: 'Carbocation intermediates always rearrange to higher stability if a hydride or alkyl shift allows.',
        timeLostSeconds: 160,
        confidenceLevel: 'wrong_uncertain',
        sourceImageName: 'Organic Reaction Diary p.43',
        createdAt: '2026-10-01T20:50:00Z'
      }
    ],
    feedbackLoopEnabledOnSubmit: true,
    processingStatus: 'completed',
    createdAt: '2026-10-01T21:40:00Z'
  }
];

export const INITIAL_AI_REPORTS: Record<string, WeeklyAiReport> = {
  '2026-W39': {
    id: 'rep_w39',
    weekId: '2026-W39',
    generatedAt: '2026-09-28T22:00:00Z',
    promptVersion: 'weekly_analysis_v1.1',
    model: 'gemini-3.8-flash',
    summary: 'Cycle 39 demonstrated that increasing CET allocation to 2:3 drastically expanded question throughput (+32% Q/hr) without hurting fundamental conceptual accuracy. However, selection errors in Mathematics remain the single largest leak of timed test marks.',
    majorObservations: [
      {
        observation: 'CET throughput increased from 11.2 Q/hr to 16.9 Q/hr during speed sessions.',
        evidence: ['Logged 88 questions in 5.2h on Day 3', 'Benchmark test completed 134/150 questions in time'],
        confidence: 0.94
      },
      {
        observation: 'Mathematics selection errors cost 14.5 minutes across 2 questions.',
        evidence: ['Day 1 definite integral consumed 9 min (expected: 2.5 min)', 'Day 2 tangent question consumed 5.5 min'],
        confidence: 0.91
      },
      {
        observation: 'Coordination Compounds and Rotational Motion represent divergent failure mechanisms: one is conceptual blindspot, while the other is application under time pressure.',
        evidence: ['Coordination compound error recorded as wrong_uncertain (concept gap)', 'Rotational error had correct formula in theory but missed rolling constraint under timed exam conditions'],
        confidence: 0.88
      }
    ],
    diagnoses: [
      {
        id: 'diag_1',
        subject: 'Mathematics',
        chapter: 'Integral Calculus (Indefinite & Definite)',
        issue: 'Selection trap: Persistence beyond 3 minutes on indefinite substitutions rather than leveraging symmetry properties.',
        type: 'selection',
        confidence: 0.92
      },
      {
        id: 'diag_2',
        subject: 'Physics',
        chapter: 'Rotational Motion',
        issue: 'Application breakdown: Incline dynamics equations fail to enforce rolling constraints (a = αR) under timed stress.',
        type: 'application',
        confidence: 0.89
      },
      {
        id: 'diag_3',
        subject: 'Physics',
        chapter: 'Electrostatics',
        issue: 'Dangerous misconception: Believing non-zero electrostatic fields can persist inside charged conductor bodies.',
        type: 'concept',
        confidence: 0.86
      }
    ],
    persistentWeaknesses: [
      {
        subject: 'Mathematics',
        chapter: 'Integral Calculus (Indefinite & Definite)',
        description: 'Persistent time sink. In benchmark tests, calculus questions averaged 4.2 minutes per attempt with 60% accuracy.',
        leakageMarks: 24
      },
      {
        subject: 'Physics',
        chapter: 'Rotational Motion',
        description: 'Rolling torque balance and angular momentum conservation continue to leak marks on multi-concept JEE questions.',
        leakageMarks: 16
      }
    ],
    improvingAreas: [
      {
        subject: 'Chemistry',
        chapter: 'Chemical Bonding & Molecular Structure',
        description: 'Hybridisation and VSEPR predictions reached 92% accuracy across 34 logged questions.',
        evidence: '0 errors logged in last 14 days of drills.'
      },
      {
        subject: 'Physics',
        chapter: 'Current Electricity',
        description: 'Kirchhoff node equations and RC transient timing solved under 90 seconds consistently in CET drills.',
        evidence: '94% accuracy in CET speed drill.'
      }
    ],
    recommendedPriorities: [
      {
        subject: 'Mathematics',
        chapter: 'Integral Calculus (Indefinite & Definite)',
        focus: 'selection',
        priority: 'high',
        reason: 'Selection failures here drain clock time that deprives accessible Chemistry questions of attention.',
        actionIntervention: 'Institute a hard 150-second abandonment protocol: if King Rule or standard substitution does not yield an obvious integral within 2.5 minutes, mark for review and skip.'
      },
      {
        subject: 'Physics',
        chapter: 'Rotational Motion',
        focus: 'application',
        priority: 'high',
        reason: 'Core concepts are understood in isolation, but combined translation + rotation torque equations fail in 3 out of 5 incline scenarios.',
        actionIntervention: 'Execute 20 deliberate Free-Body Diagram reconstructions focusing explicitly on friction torque direction about Center of Mass.'
      },
      {
        subject: 'Physics',
        chapter: 'Electrostatics',
        focus: 'concept',
        priority: 'medium',
        reason: 'Conductor boundary condition misconception is dangerous because student answered with high subjective confidence.',
        actionIntervention: 'Re-derive Gauss Law boundary conditions for conductors with internal cavities and dielectric interfaces.'
      }
    ],
    nextWeekExperiment: {
      hypothesis: 'Adopting a 3:2 allocation with a strict 150-second abandonment timer on Mathematics will lift overall test score by ~15 marks while preserving CET question throughput above 15 Q/hr.',
      intervention: 'Enforce the 150s timer in all daily timed blocks; allocate 3 days to JEE depth and 2 days to CET velocity.',
      measurement: 'Compare Cycle 40 JEE Benchmark score against baseline Cycle 38 (162/300) and measure average time spent on incorrect Mathematics questions.'
    },
    provenanceTraces: [
      {
        id: 'diag_1',
        diagnosisIssue: 'Selection trap: Persistence beyond 3 minutes on indefinite substitutions rather than leveraging symmetry properties.',
        subject: 'Mathematics',
        chapter: 'Integral Calculus (Indefinite & Definite)',
        sourceNotebookNote: 'Q.39 - Definite integral with King Rule: Spent 9 mins trying substitution before realizing King property gives 2I immediately. Selection error: should have abandoned after 2 mins.',
        sourceImageName: 'Rotational Motion & Electrostatics Error Sheet p.42',
        normalizedErrorType: 'selection',
        computedAccuracy: '60.0% (15 attempts)',
        attemptsCount: 15,
        timeLostTotalMin: 9.0,
        aiInference: 'The student exhibits the sunk-cost fallacy in integration: excessive time investment on questions that could be resolved via standard symmetry properties.',
        confidence: 0.92
      },
      {
        id: 'diag_2',
        diagnosisIssue: 'Application breakdown: Incline dynamics equations fail to enforce rolling constraints (a = αR) under timed stress.',
        subject: 'Physics',
        chapter: 'Rotational Motion',
        sourceNotebookNote: 'Q.14 - Rolling on rough incline: Forgot that friction provides torque about CM while acting up the plane. Wrote a = g sinθ without (1 + I/mR²). Lost 5.5 min on wrong quadratic.',
        sourceImageName: 'Rotational Motion & Electrostatics Error Sheet p.42',
        normalizedErrorType: 'application',
        computedAccuracy: '68.2% (22 attempts)',
        attemptsCount: 22,
        timeLostTotalMin: 5.5,
        aiInference: 'Formula memory is intact when asked verbally, but applying simultaneous F = ma and τ = Iα fails under timed test constraints.',
        confidence: 0.89
      },
      {
        id: 'diag_3',
        diagnosisIssue: 'Dangerous misconception: Believing non-zero electrostatic fields can persist inside charged conductor bodies.',
        subject: 'Physics',
        chapter: 'Electrostatics',
        sourceNotebookNote: 'Q.28 - Concentric shells with dielectric: Correctly identified Gauss Law formula, but assumed field inside inner conductor was non-zero. Confused surface charge density distribution.',
        sourceImageName: 'Rotational Motion & Electrostatics Error Sheet p.42',
        normalizedErrorType: 'concept',
        computedAccuracy: '76.0% (25 attempts)',
        attemptsCount: 25,
        timeLostTotalMin: 4.0,
        aiInference: 'Recorded with wrong_confident tag: this represents a high-priority cognitive error because the student does not recognize the boundary condition failure.',
        confidence: 0.86
      }
    ]
  }
};
