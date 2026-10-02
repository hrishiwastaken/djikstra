import { PreparationWeek, StudyDay, WeeklyAiReport } from '../types';

// Canonical curriculum (Section 14: Shared syllabus infrastructure)
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

// Clean starting state - No mock data
export const NOTEBOOK_PHOTO_PRESETS: any[] = [];

export const INITIAL_WEEKS: PreparationWeek[] = [
  {
    id: '2026-W40',
    title: 'Cycle 1 (Fresh Preparation Cycle)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    jeeDays: 3,
    cetDays: 2,
    allocationRatio: '3:2',
    benchmarkExam: 'JEE',
    targetWeeklyHours: 30,
    status: 'active'
  }
];

export const INITIAL_STUDY_DAYS: StudyDay[] = [];

export const INITIAL_AI_REPORTS: Record<string, WeeklyAiReport> = {};
