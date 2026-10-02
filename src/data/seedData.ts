import { PreparationWeek, StudyDay, WeeklyAiReport } from '../types';

export interface ConceptItem {
  name: string;
}

export interface ChapterItem {
  chapter: string;
  concepts: string[];
}

export interface CurriculumDatabase {
  Physics: ChapterItem[];
  Chemistry: ChapterItem[];
  Mathematics: ChapterItem[];
}

// Complete Canonical Syllabus (Section 14: Shared syllabus infrastructure)
export const CANONICAL_CURRICULUM: CurriculumDatabase = {
  Physics: [
    {
      chapter: 'Units and Measurements',
      concepts: [
        'Need for measurement, base and derived SI units',
        'Dimensions of physical quantities and dimensional analysis applications',
        'Systematic, random, and gross errors',
        'Absolute, relative, and percentage errors; combination and propagation of errors',
        'Significant figures and rounding off rules',
        'Least count of measuring instruments'
      ]
    },
    {
      chapter: 'Kinematics',
      concepts: [
        'Frame of reference, position-time and velocity-time graphs',
        'Speed, average velocity, and instantaneous velocity',
        'Uniformly accelerated motion and kinematic equations of motion',
        'Vectors and scalars: Unit vectors, vector resolution, scalar and vector products',
        'Projectile motion: Trajectory, maximum height, time of flight, horizontal range',
        'Uniform circular motion: Angular displacement, angular velocity, and centripetal acceleration'
      ]
    },
    {
      chapter: 'Laws of Motion',
      concepts: [
        'Intuitive concept of force, inertia, and Newton’s First Law of Motion',
        'Momentum, Newton’s Second Law of Motion, impulse and impulse-momentum theorem',
        'Newton’s Third Law of Motion and law of conservation of linear momentum',
        'Equilibrium of concurrent forces and free-body diagrams',
        'Static and kinetic friction, laws of friction, angle of friction, and angle of repose',
        'Dynamics of circular motion: Centripetal force, centrifugal force, banking of roads, and vertical circular motion'
      ]
    },
    {
      chapter: 'Work, Energy, and Power',
      concepts: [
        'Work done by a constant force and variable forces',
        'Kinetic energy, potential energy, and Work-Energy Theorem',
        'Conservative and non-conservative forces, potential energy of a spring',
        'Law of conservation of mechanical energy',
        'Motion in a vertical circle',
        'Instantaneous and average power',
        'Collisions: Elastic and inelastic collisions in 1D and 2D, coefficient of restitution'
      ]
    },
    {
      chapter: 'Rotational Motion and System of Particles',
      concepts: [
        'Centre of mass of a two-particle system, discrete systems, and rigid bodies',
        'Linear momentum conservation of a system of particles',
        'Torque, angular momentum, and principle of conservation of angular momentum',
        'Moment of inertia, radius of gyration, parallel and perpendicular axes theorems',
        'Moment of inertia of uniform geometrical bodies (rings, discs, cylinders, spheres, rods)',
        'Dynamics of rigid body rotation and pure rolling motion on flat and inclined planes'
      ]
    },
    {
      chapter: 'Gravitation',
      concepts: [
        'Universal Law of Gravitation and gravitational constant (G)',
        'Acceleration due to gravity (g) and its variation with altitude, depth, and Earth\'s rotation',
        'Gravitational potential, gravitational field, and gravitational potential energy',
        'Kepler’s laws of planetary motion',
        'Escape velocity and orbital velocity of satellites',
        'Geostationary and polar satellites, weightlessness'
      ]
    },
    {
      chapter: 'Mechanical Properties of Solids (Elasticity)',
      concepts: [
        'Stress-strain relationship, Hooke’s law, and elastic limit',
        'Stress-strain curve (proportional limit, yield point, breaking stress)',
        'Moduli of elasticity: Young’s modulus, bulk modulus, and shear modulus',
        'Poisson’s ratio and elastic potential energy stored in a stretched wire'
      ]
    },
    {
      chapter: 'Mechanical Properties of Fluids',
      concepts: [
        'Fluid pressure, Pascal’s law and applications (hydraulic lift, hydraulic brakes)',
        'Variation of pressure with depth, atmospheric pressure, and gauge pressure',
        'Viscosity, Stokes’ law, terminal velocity, streamline and turbulent flow',
        'Critical velocity, Reynolds number, and Poiseuille’s formula',
        'Surface tension, surface energy, angle of contact, excess pressure across curved surfaces, and capillary rise',
        'Equation of continuity, Bernoulli’s theorem and applications (Venturimeter, aerodynamic lift)'
      ]
    },
    {
      chapter: 'Thermal Properties of Matter',
      concepts: [
        'Heat, temperature, and thermal expansion (linear, superficial, cubical)',
        'Specific heat capacity, molar heat capacity, calorimetry, and latent heat',
        'Phase transitions and triple point',
        'Conduction, thermal conductivity, convection, and thermal radiation',
        'Black body radiation: Stefan-Boltzmann law, Wien’s displacement law, Newton’s law of cooling'
      ]
    },
    {
      chapter: 'Thermodynamics',
      concepts: [
        'Thermal equilibrium and Zeroth Law of Thermodynamics',
        'First Law of Thermodynamics: Work done, internal energy, and heat',
        'Thermodynamic processes: Isothermal, adiabatic, isobaric, isochoric, and cyclic (P-V diagrams)',
        'Second Law of Thermodynamics: Reversible and irreversible processes',
        'Heat engines, Carnot cycle, Carnot efficiency, refrigerators, and coefficient of performance'
      ]
    },
    {
      chapter: 'Kinetic Theory of Gases',
      concepts: [
        'Equation of state of an ideal gas and assumptions of kinetic theory',
        'Kinetic interpretation of temperature and derivation of gas pressure',
        'RMS, average, and most probable speeds of gas molecules',
        'Degrees of freedom and Law of Equipartition of Energy',
        'Specific heats of gases (Cp, Cv) and Mayer’s relation (Cp - Cv = R)',
        'Mean free path'
      ]
    },
    {
      chapter: 'Oscillations (Simple Harmonic Motion)',
      concepts: [
        'Periodic and oscillatory motion, period, frequency, and displacement equations',
        'Simple Harmonic Motion (SHM) and differential equation of SHM',
        'Phase, velocity, acceleration, and kinetic and potential energies in SHM',
        'Simple pendulum: Derivation of time period',
        'Spring-mass systems: Series and parallel combinations',
        'Free, damped, and forced oscillations; resonance'
      ]
    },
    {
      chapter: 'Waves',
      concepts: [
        'Longitudinal and transverse waves, wave speed equation, speed of sound (Laplace’s formula)',
        'Principle of superposition of waves and reflection of waves',
        'Standing waves in strings and organ pipes: Harmonics and overtones',
        'Beats and beat frequency',
        'Acoustics and Doppler effect in sound'
      ]
    },
    {
      chapter: 'Electrostatics',
      concepts: [
        'Electric charges, quantization, and conservation of charge',
        'Coulomb’s law in vector form and principle of superposition',
        'Electric field, field lines, electric dipole, and dipole moment',
        'Torque and potential energy of a dipole in an external electric field',
        'Electric flux and Gauss’s law with applications (infinite wire, plane sheet, spherical shell)',
        'Electric potential, potential difference, and equipotential surfaces',
        'Potential energy of single charges, systems of charges, and dipoles',
        'Conductors, insulators, dielectrics, and electric polarization',
        'Capacitance, parallel plate capacitor (with/without dielectric), combinations of capacitors, and energy stored in a capacitor'
      ]
    },
    {
      chapter: 'Current Electricity',
      concepts: [
        'Electric current, drift velocity, mobility, and Ohm’s law',
        'Resistance, resistivity, conductance, conductivity, and temperature dependence of resistance',
        'Series and parallel combinations of resistors',
        'EMF, internal resistance of a cell, terminal voltage, and combinations of cells',
        'Kirchhoff’s circuit laws (KCL and KVL)',
        'Wheatstone bridge and Metre bridge',
        'Potentiometer: Principle, comparison of EMFs, and internal resistance measurement'
      ]
    },
    {
      chapter: 'Magnetic Effects of Current and Magnetism',
      concepts: [
        'Biot-Savart law and magnetic field due to straight conductors and circular loops',
        'Ampere’s circuital law and applications to long wires, solenoids, and toroids',
        'Force on a moving charge in magnetic and electric fields (Lorentz force)',
        'Force between two parallel current-carrying conductors (definition of ampere)',
        'Torque on a current loop, magnetic dipole moment, and moving coil galvanometer',
        'Earth’s magnetic field: Magnetic elements (declination, dip, horizontal component)',
        'Magnetic properties of materials: Diamagnetism, paramagnetism, and ferromagnetism; hysteresis loop'
      ]
    },
    {
      chapter: 'Electromagnetic Induction (EMI) and Alternating Currents (AC)',
      concepts: [
        'Magnetic flux, Faraday’s laws of induction, and Lenz’s law',
        'Motional EMF, self-inductance, mutual inductance, and eddy currents',
        'Alternating current: Peak, average, and RMS values',
        'AC circuits containing pure R, L, C, and series LCR circuits',
        'Reactance, impedance, phase relations, resonance, and Q-factor',
        'Power in AC circuits, power factor, and wattless current',
        'AC generator and transformers (step-up, step-down, energy losses)'
      ]
    },
    {
      chapter: 'Electromagnetic Waves',
      concepts: [
        'Displacement current and Maxwell’s equations (qualitative idea)',
        'Characteristics, velocity, and transverse nature of electromagnetic waves',
        'Electromagnetic spectrum (radio, microwaves, infrared, visible, UV, X-rays, gamma rays) and practical applications'
      ]
    },
    {
      chapter: 'Ray Optics and Optical Instruments',
      concepts: [
        'Reflection by spherical mirrors, mirror formula, and magnification',
        'Refraction at plane surfaces, Snell’s law, total internal reflection, and optical fibres',
        'Refraction at spherical surfaces, thin lens formula, lens maker’s formula, and power of a lens',
        'Refraction and dispersion through a prism, angle of minimum deviation',
        'Optical instruments: Magnifying power of simple microscopes, compound microscopes, and astronomical telescopes'
      ]
    },
    {
      chapter: 'Wave Optics',
      concepts: [
        'Huygens’ wave theory, wavefronts, and derivation of laws of reflection and refraction',
        'Interference of light: Coherent sources, Young’s Double Slit Experiment (YDSE), and fringe width expression',
        'Diffraction: Single slit diffraction, central maximum, and limit of resolution',
        'Polarisation: Plane polarized light, Brewster’s law, Malus’s law, and polaroids'
      ]
    },
    {
      chapter: 'Dual Nature of Radiation and Matter',
      concepts: [
        'Photoelectric effect: Hertz and Lenard’s observations, work function, cutoff frequency, and stopping potential',
        'Einstein’s photoelectric equation and photon properties',
        'De Broglie hypothesis: Matter waves and de Broglie wavelength of particles',
        'Davisson-Germer experiment'
      ]
    },
    {
      chapter: 'Atoms and Nuclei',
      concepts: [
        'Alpha-particle scattering experiment and Rutherford’s atomic model',
        'Bohr’s model of hydrogen-like atoms: Energy levels, orbital radius, velocity, and hydrogen spectrum',
        'Composition and size of the nucleus, mass defect, and binding energy per nucleon curve',
        'Nuclear forces and properties',
        'Radioactivity: Alpha, beta, and gamma decays; Radioactive decay law, half-life, and mean-life',
        'Nuclear fission, nuclear fusion, and mass-energy equivalence (E = mc²)'
      ]
    },
    {
      chapter: 'Electronic Devices (Semiconductors)',
      concepts: [
        'Energy band theory: Conductors, semiconductors, and insulators',
        'Intrinsic and extrinsic semiconductors (p-type and n-type)',
        'p-n junction: Depletion region, barrier potential, and forward/reverse bias characteristics',
        'Junction diode as a rectifier: Half-wave and full-wave rectifiers',
        'Special diodes: Zener diode (voltage regulator), LED, photodiode, and solar cell',
        'Logic gates: AND, OR, NOT, NAND, NOR, XOR, and truth tables'
      ]
    },
    {
      chapter: 'Experimental Skills / Practical Physics',
      concepts: [
        'Vernier calliper and screw gauge: Zero error and measurement of dimensions',
        'Metre scale: Principle of moments',
        'Young’s modulus by Searle’s method',
        'Surface tension by capillary rise method',
        'Coefficient of viscosity by terminal velocity (Stokes’ method)',
        'Speed of sound using resonance tube',
        'Specific heat capacity by method of mixtures (calorimeter)',
        'Metre bridge: Resistance and resistivity determination',
        'Ohm’s law verification and galvanometer figure of merit',
        'Focal length determination of convex lens, concave mirror, and angle of minimum deviation of prism',
        'Identification of electronic components (resistor, diode, capacitor, IC)'
      ]
    }
  ],

  Chemistry: [
    {
      chapter: 'Some Basic Concepts in Chemistry',
      concepts: [
        'Nature of matter, Dalton’s atomic theory, atomic and molecular masses',
        'Mole concept, molar mass, and Avogadro’s number',
        'Percentage composition, empirical formula, and molecular formula',
        'Chemical stoichiometry and limiting reagent calculations',
        'Concentration terms: Molarity, molality, normality, mole fraction, mass percentage, and ppm'
      ]
    },
    {
      chapter: 'Structure of Atom',
      concepts: [
        'Discovery of subatomic particles and cathode ray experiments',
        'Electromagnetic radiation, Planck’s quantum theory, and photoelectric effect',
        'Bohr’s model of hydrogen atom, line spectrum of hydrogen, and Rydberg equation',
        'Dual nature of matter (de Broglie relation) and Heisenberg’s uncertainty principle',
        'Quantum mechanical model: Quantum numbers (n, l, ml, ms) and shapes of s, p, d orbitals',
        'Aufbau principle, Pauli’s exclusion principle, and Hund’s rule of maximum multiplicity',
        'Electronic configurations and stability of half-filled and completely filled subshells'
      ]
    },
    {
      chapter: 'Chemical Thermodynamics',
      concepts: [
        'System, surroundings, intensive and extensive properties, state and path functions',
        'First Law of Thermodynamics: Internal energy (U), work (w), and heat (q)',
        'Enthalpy (H) and relation between ΔH and ΔU',
        'Heat capacities (Cp, Cv) and relation Cp - Cv = R',
        'Thermochemistry: Hess’s Law of constant heat summation',
        'Enthalpies of reaction, formation, combustion, neutralization, atomization, and bond dissociation',
        'Second Law of Thermodynamics: Spontaneity, entropy (S), and absolute entropy',
        'Gibbs free energy (G), standard free energy change (ΔG°), spontaneity criteria, and equilibrium relation'
      ]
    },
    {
      chapter: 'Solutions',
      concepts: [
        'Types of solutions and solubility of solids and gases in liquids (Henry’s law)',
        'Raoult’s law for ideal and non-ideal solutions; positive and negative deviations',
        'Colligative property 1: Relative lowering of vapour pressure',
        'Colligative property 2: Elevation of boiling point and ebullioscopic constant (Kb)',
        'Colligative property 3: Depression of freezing point and cryoscopic constant (Kf)',
        'Colligative property 4: Osmotic pressure, reverse osmosis, and isotonic solutions',
        'Van \'t Hoff factor (i), abnormal molecular mass, and degree of dissociation/association'
      ]
    },
    {
      chapter: 'Equilibrium',
      concepts: [
        'Dynamic nature of chemical equilibrium and Law of Mass Action',
        'Equilibrium constants: Kc and Kp, and relation Kp = Kc(RT)^Δng',
        'Le Chatelier’s principle: Effect of temperature, pressure, concentration, and inert gas',
        'Arrhenius, Brønsted-Lowry, and Lewis concepts of acids and bases',
        'Ionization of weak acids and bases, Ostwald’s dilution law, and ionic product of water (Kw)',
        'pH scale, common ion effect, and salt hydrolysis',
        'Buffer solutions: Acidic and basic buffers, Henderson-Hasselbalch equation',
        'Solubility product (Ksp) and precipitation reactions'
      ]
    },
    {
      chapter: 'Redox Reactions and Electrochemistry',
      concepts: [
        'Oxidation states, redox reactions, and balancing redox equations',
        'Conductance in electrolytic solutions, specific conductance, molar conductance (Λm), and cell constant',
        'Kohlrausch’s law of independent migration of ions and applications',
        'Galvanic cells, Daniel cell, electrode potentials, and standard hydrogen electrode (SHE)',
        'Nernst equation and calculation of cell EMF, equilibrium constants, and Gibbs free energy',
        'Commercial cells/batteries: Dry cell, lead storage battery, and fuel cells',
        'Corrosion: Mechanism and prevention methods'
      ]
    },
    {
      chapter: 'Chemical Kinetics',
      concepts: [
        'Rate of reaction (instantaneous and average) and factors affecting reaction rates',
        'Order and molecularity of reactions',
        'Differential and integrated rate laws for zero-order and first-order reactions',
        'Half-life period of zero and first-order reactions',
        'Pseudo-first-order reactions',
        'Temperature dependence of rate constant: Arrhenius equation and activation energy (Ea)',
        'Collision theory of chemical reactions'
      ]
    },
    {
      chapter: 'States of Matter and Surface Chemistry (CET / Integrated Board)',
      concepts: [
        'Gas laws: Boyle’s, Charles’s, Gay-Lussac’s, Avogadro’s, and ideal gas equation',
        'Dalton’s law of partial pressures and Graham’s law of diffusion',
        'Deviation of real gases from ideal behavior: Van der Waals equation and compressibility factor (Z)',
        'Physical and chemical adsorption, Freundlich adsorption isotherm',
        'Colloidal state: Lyophilic, lyophobic, macromolecular, and associated colloids (micelles)',
        'Properties of colloids: Tyndall effect, Brownian motion, electrophoresis, coagulation, and Hardy-Schulze rule'
      ]
    },
    {
      chapter: 'Classification of Elements and Periodicity in Properties',
      concepts: [
        'Modern periodic law, long form of periodic table, and electronic configurations',
        'Periodic trends: Atomic and ionic radii, lanthanoid contraction',
        'Ionization enthalpy and factors governing it',
        'Electron gain enthalpy and electronegativity trends (Pauling scale)',
        'Valency, anomalous behavior of second-period elements, and diagonal relationships'
      ]
    },
    {
      chapter: 'Chemical Bonding and Molecular Structure',
      concepts: [
        'Ionic bond, lattice enthalpy, Born-Haber cycle, and Fajan’s rules',
        'Covalent bond, Lewis structures, octet rule, and formal charge',
        'Electronegativity difference, dipole moments, and percentage ionic character',
        'Valence Shell Electron Pair Repulsion (VSEPR) theory and geometry of molecules',
        'Valence Bond Theory (VBT), hybridization (sp, sp², sp³, dsp², sp³d, sp³d²)',
        'Molecular Orbital Theory (MOT): LCAO method, bonding and antibonding orbitals, bond order, and magnetic character of homonuclear diatomic molecules',
        'Hydrogen bonding: Intermolecular and intramolecular hydrogen bonds'
      ]
    },
    {
      chapter: 'p-Block Elements (Groups 13 to 18)',
      concepts: [
        'Group trends, inert pair effect, anomalous properties of first elements',
        'Group 13: Boron family, diborane preparation/structure, and boric acid',
        'Group 14: Carbon family, catenation, allotropes (diamond, graphite, fullerenes), and silicates',
        'Group 15: Nitrogen family, ammonia manufacture (Haber process), nitric acid (Ostwald process), oxides of nitrogen, and phosphorus allotropes/halides',
        'Group 16: Oxygen family, ozone, allotropes of sulphur, and sulphuric acid (Contact process)',
        'Group 17: Halogens family, preparation/properties of chlorine, hydrochloric acid, and interhalogen compounds',
        'Group 18: Noble gases, chemical inertness, and Xenon fluorides/oxides (XeF₂, XeF₄, XeF₆, XeO₃)'
      ]
    },
    {
      chapter: 'd- and f-Block Elements',
      concepts: [
        'Transition metals: General electronic configuration, metallic character, and variable oxidation states',
        'Physical and chemical trends: Atomic radii, ionization energies, magnetic moments, catalytic behavior, interstitial compounds, and alloy formation',
        'Potassium dichromate (K₂Cr₂O₇) and potassium permanganate (KMnO₄): Preparation and oxidizing properties',
        'Lanthanoids: Electronic configuration, oxidation states, lanthanoid contraction, and consequences',
        'Actinoids: Electronic configuration, oxidation states, and general comparison with lanthanoids'
      ]
    },
    {
      chapter: 'Coordination Compounds',
      concepts: [
        'Ligands, coordination number, coordination sphere, and IUPAC nomenclature',
        'Structural isomerism (ionization, hydrate, linkage, coordination)',
        'Stereoisomerism (geometrical and optical isomerism)',
        'Werner’s coordination theory',
        'Valence Bond Theory (inner and outer orbital complexes, magnetic character)',
        'Crystal Field Theory (CFT): Crystal field splitting in octahedral and tetrahedral complexes, spectrochemical series, and CFSE',
        'Stability and applications of coordination complexes'
      ]
    },
    {
      chapter: 'Extraction of Metals / Metallurgy (CET / Board Reference)',
      concepts: [
        'Minerals, ores, and concentration methods (gravity separation, magnetic separation, froth flotation, leaching)',
        'Extraction of crude metals: Calcination, roasting, and smelting',
        'Thermodynamic principles of metallurgy: Ellingham diagrams',
        'Refining methods: Distillation, liquation, electrolytic refining, zone refining, and vapour phase refining (Mond and Van Arkel processes)'
      ]
    },
    {
      chapter: 'Purification and Characterization of Organic Compounds',
      concepts: [
        'Qualitative elemental analysis: Detection of Nitrogen, Sulphur, and Halogens (Lassaigne’s test)',
        'Quantitative elemental analysis: Estimation of Carbon, Hydrogen (Liebig method), Nitrogen (Dumas and Kjeldahl methods), and Halogens (Carius method)',
        'Calculations of empirical and molecular formulas'
      ]
    },
    {
      chapter: 'Basic Principles of Organic Chemistry (GOC & Isomerism)',
      concepts: [
        'IUPAC nomenclature of mono- and poly-functional organic compounds',
        'Inductive effect, electromeric effect, resonance (mesomeric) effect, and hyperconjugation',
        'Cleavage of covalent bonds: Homolytic and heterolytic fission',
        'Reactive intermediates: Carbocations, carbanions, free radicals (stability orders)',
        'Types of organic reactions: Substitution, addition, elimination, and rearrangement',
        'Structural isomerism: Chain, position, functional, metamerism, and tautomerism',
        'Stereoisomerism: Geometrical isomerism (cis-trans, E-Z) and optical isomerism (chirality, enantiomers, diastereomers, racemic mixtures)'
      ]
    },
    {
      chapter: 'Hydrocarbons',
      concepts: [
        'Alkanes: Conformational analysis of ethane (Newman and Sawhorse projections), free-radical halogenation mechanism',
        'Alkenes: Structure, geometrical isomerism, preparation by elimination, electrophilic addition of halogens, Markovnikov’s rule, peroxide effect (Kharasch), ozonolysis, and oxidation',
        'Alkynes: Structure, acidity of terminal alkynes, addition reactions (hydrogen, halogens, water), and cyclic polymerization',
        'Aromatic hydrocarbons: Benzene structure, aromaticity (Hückel’s 4n+2 rule), electrophilic aromatic substitution (halogenation, nitration, sulphonation, Friedel-Crafts alkylation and acylation), and directing groups'
      ]
    },
    {
      chapter: 'Organic Compounds Containing Halogens (Haloalkanes and Haloarenes)',
      concepts: [
        'Nomenclature and nature of C-X bond',
        'Nucleophilic substitution reactions: SN1 and SN2 mechanisms, kinetics, and stereochemistry (inversion vs retention)',
        'Elimination reactions: Dehydrohalogenation, Saytzeff’s rule, E1 and E2 mechanisms',
        'Organometallic reactions: Grignard reagent formation, Wurtz reaction, Fittig reaction, and Wurtz-Fittig reaction',
        'Haloarenes: Low reactivity towards nucleophilic substitution and electrophilic substitution patterns',
        'Uses and environmental impact of polyhalogen compounds (chloroform, iodoform, Freons, DDT)'
      ]
    },
    {
      chapter: 'Alcohols, Phenols, and Ethers',
      concepts: [
        'Alcohols: Nomenclature, classification, preparation, acidic character, dehydration mechanism, Lucas test, and oxidation',
        'Phenols: Preparation (from cumene, diazonium salts, chlorobenzene), acidic nature, electrophilic substitutions (bromination, nitration), Kolbe’s reaction, and Reimer-Tiemann reaction',
        'Ethers: Nomenclature, preparation by Williamson ether synthesis, dehydration of alcohols, and acidic cleavage by HI'
      ]
    },
    {
      chapter: 'Aldehydes, Ketones, and Carboxylic Acids',
      concepts: [
        'Aldehydes and Ketones: Carbonyl group structure, preparations (oxidation of alcohols, ozonolysis, Rosenmund reduction, Gattermann-Koch, Stephen\'s reaction)',
        'Nucleophilic addition reactions (HCN, NaHSO₃, alcohols, Grignard reagents, ammonia derivatives)',
        'Reactions involving α-hydrogens: Aldol condensation, cross-aldol condensation, and haloform reaction',
        'Non-enolizable reactions: Cannizzaro reaction',
        'Reductions: Clemmensen reduction, Wolff-Kishner reduction, and LiAlH₄/NaBH₄ reductions',
        'Distinction tests: Tollens’ test and Fehling’s test',
        'Carboxylic Acids: Nomenclature, acidity and substituent effects, preparation methods, Hell-Volhard-Zelinsky (HVZ) reaction, decarboxylation, and functional derivatives (esters, acid chlorides, amides)'
      ]
    },
    {
      chapter: 'Organic Compounds Containing Nitrogen (Amines and Diazonium Salts)',
      concepts: [
        'Amines: Nomenclature, classification, basicity order (aqueous and gas phases)',
        'Preparation of amines: Reduction of nitro compounds/nitriles/amides, Gabriel phthalimide synthesis, and Hoffmann bromamide degradation',
        'Chemical reactions: Carbylamine test, reaction with nitrous acid, Hinsberg’s test, and electrophilic aromatic substitution of aniline',
        'Diazonium salts: Diazotization, stability, synthetic replacements (-OH, -Cl, -Br, -I, -CN, -H via Sandmeyer/Gattermann reactions), and azo-coupling reactions'
      ]
    },
    {
      chapter: 'Biomolecules',
      concepts: [
        'Carbohydrates: Classification, monosaccharides (glucose, fructose), cyclic hemiacetal structures, mutarotation, and D/L configurations',
        'Disaccharides: Sucrose, lactose, maltose, and glycosidic linkages',
        'Polysaccharides: Starch, cellulose, and glycogen',
        'Proteins: Classification of amino acids, essential and non-essential amino acids, zwitterion structure, isoelectric point',
        'Peptide bonds and protein structure (primary, secondary α-helix/β-pleated, tertiary, quaternary), and denaturation of proteins',
        'Nucleic acids: Chemical constituents (pentose sugar, nitrogenous bases, phosphoric acid), nucleosides, nucleotides, and DNA double helix model',
        'Enzymes and Vitamins: Classification and deficiency diseases'
      ]
    },
    {
      chapter: 'Polymers and Chemistry in Everyday Life (CET / Board Reference)',
      concepts: [
        'Polymers: Classification, addition vs condensation polymerization, copolymers',
        'Commercial polymers: Natural rubber, vulcanization, synthetic rubbers (Buna-S, Buna-N, Neoprene), Bakelite, Nylon-6, Nylon-6,6, Terylene, and Teflon',
        'Drugs and medicines: Antacids, antihistamines, analgesics, antipyretics, antiseptics, disinfectants, and antibiotics',
        'Food chemicals and cleansing agents: Artificial sweeteners, food preservatives, soaps, and synthetic detergents'
      ]
    },
    {
      chapter: 'Principles Related to Practical Chemistry',
      concepts: [
        'Systematic qualitative analysis of inorganic salts: Cations (Pb²⁺, Cu²⁺, Al³⁺, Fe³⁺, Zn²⁺, Ni²⁺, Ca²⁺, Ba²⁺, Mg²⁺, NH₄⁺) and Anions (CO₃²⁻, S²⁻, SO₄²⁻, NO₃⁻, Cl⁻, Br⁻, I⁻)',
        'Detection of functional groups: Unsaturation, -OH (alcoholic and phenolic), -CHO, >C=O, -COOH, and -NH₂',
        'Volumetric analysis: Acid-base titrations, redox titrations with KMnO₄ and Mohr\'s salt/oxalic acid'
      ]
    }
  ],

  Mathematics: [
    {
      chapter: 'Sets, Relations, and Functions',
      concepts: [
        'Sets: Representation, subsets, power set, universal set, Venn diagrams, and De Morgan’s laws',
        'Cartesian product of sets and relations',
        'Types of relations: Reflexive, symmetric, transitive, and equivalence relations',
        'Functions: Domain, codomain, range, and real-valued functions',
        'Classification of functions: Injective (one-one), surjective (onto), and bijective functions',
        'Composite functions and inverse functions'
      ]
    },
    {
      chapter: 'Complex Numbers and Quadratic Equations',
      concepts: [
        'Representation of complex numbers, algebra of complex numbers, modulus, and conjugate',
        'Argand plane, polar representation, Euler’s form, and triangle inequalities',
        'Quadratic equations with real coefficients, discriminant, and nature of roots',
        'Relations between roots and coefficients, formation of equations with given roots',
        'Common roots of two quadratic equations, sign of quadratic expressions, and location of roots'
      ]
    },
    {
      chapter: 'Matrices and Determinants',
      concepts: [
        'Matrices: Types of matrices, matrix addition, scalar multiplication, and matrix multiplication',
        'Transpose of a matrix, symmetric, and skew-symmetric matrices',
        'Determinants: Expansion, minors, cofactors, and determinant properties',
        'Adjoint of a matrix and inverse of a square matrix',
        'System of linear equations: Consistency, inconsistency, Cramer’s Rule, and matrix inversion method (AX = B)'
      ]
    },
    {
      chapter: 'Permutations and Combinations',
      concepts: [
        'Fundamental principles of counting (addition and multiplication rules)',
        'Factorials, permutations of distinct objects, and permutations with repetition',
        'Circular permutations',
        'Combinations: Selections, combinatorial identities (ⁿCᵣ = ⁿCₙ₋ᵣ, ⁿCᵣ + ⁿCᵣ₋₁ = ⁿ⁺¹Cᵣ)',
        'Division and distribution of objects into groups, geometric problem applications, and derangements'
      ]
    },
    {
      chapter: 'Binomial Theorem',
      concepts: [
        'Binomial theorem for positive integral index and Pascal’s triangle',
        'General term and middle term(s) in a binomial expansion',
        'Properties and summation of binomial coefficients',
        'Binomial approximations and divisibility/remainder applications'
      ]
    },
    {
      chapter: 'Sequences and Series',
      concepts: [
        'Arithmetic Progression (A.P.): General term, sum of n terms, and Arithmetic Mean (A.M.)',
        'Geometric Progression (G.P.): General term, sum of n terms, sum of infinite terms, and Geometric Mean (G.M.)',
        'Relationship between A.M. and G.M. (A ≥ G)',
        'Arithmetico-Geometric Progression (A.G.P.) and summation techniques',
        'Sum of special series: ∑n, ∑n², ∑n³, and method of differences'
      ]
    },
    {
      chapter: 'Trigonometry',
      concepts: [
        'Radian and degree angle measurements, trigonometric functions, and quadrant signs',
        'Fundamental trigonometric identities',
        'Compound angle, double angle, and triple angle identities',
        'Product-to-sum and sum-to-product transformation formulas',
        'Trigonometric equations: General and principal solutions (CET focus)',
        'Properties of triangles: Sine rule, Cosine rule, projection formulae, and area of a triangle (CET focus)',
        'Inverse Trigonometric Functions: Domain, range, principal value branches, and fundamental properties/identities'
      ]
    },
    {
      chapter: 'Mathematical Logic (CET Exclusive)',
      concepts: [
        'Statements, truth values, and logical connectives (conjunction, disjunction, negation, conditional, biconditional)',
        'Truth tables, tautology, contradiction, and contingency',
        'Logical equivalences and algebra of statements',
        'Negation of compound statements',
        'Quantifiers, quantified statements, duality principle, and switching circuits'
      ]
    },
    {
      chapter: 'Straight Lines and Pair of Straight Lines',
      concepts: [
        'Cartesian coordinate system, distance formula, section formula, and area of triangles',
        'Slope of a line, angle between lines, parallel and perpendicular line conditions',
        'Forms of line equations: Slope-intercept, point-slope, two-point, intercept, and normal forms',
        'Distance of a point from a line and distance between parallel lines',
        'Concurrency of three lines and family of lines passing through the intersection of two lines',
        'Pair of straight lines passing through the origin (homogeneous second-degree equation ax² + 2hxy + by² = 0)',
        'Angle between a pair of lines, condition for perpendicularity and coincidence, and general second-degree equation representing lines (CET focus)'
      ]
    },
    {
      chapter: 'Conic Sections',
      concepts: [
        'Circle: Standard and general forms, centre, radius, diameter endpoints form',
        'Tangent to a circle, condition of tangency (c² = a²(1+m²)), chord of contact, and length of tangent',
        'Parabola: Standard forms (y² = 4ax, y² = -4ax, x² = 4ay, x² = -4ay), focus, vertex, directrix, and latus rectum',
        'Ellipse: Standard form (x²/a² + y²/b² = 1), eccentricity (e < 1), foci, directrices, major/minor axes, and latus rectum',
        'Hyperbola: Standard form (x²/a² - y²/b² = 1), eccentricity (e > 1), foci, directrices, axes, latus rectum, and rectangular hyperbola',
        'Parametric equations and equations of tangents for conics'
      ]
    },
    {
      chapter: 'Limits, Continuity, and Differentiability',
      concepts: [
        'Intuitive idea of limits, left-hand limit (LHL), and right-hand limit (RHL)',
        'Standard algebraic, trigonometric, exponential, and logarithmic limits',
        'Evaluation of indeterminate forms (0/0, ∞/∞, 0×∞, ∞-∞, 1^∞) and L’Hôpital’s rule',
        'Continuity of functions at a point and over an interval; algebra of continuous functions',
        'Differentiability at a point and over an interval; relation between continuity and differentiability'
      ]
    },
    {
      chapter: 'Differentiation',
      concepts: [
        'Derivative definition and differentiation from first principles',
        'Derivatives of standard polynomial, trigonometric, inverse trigonometric, exponential, and logarithmic functions',
        'Rules of differentiation: Sum, product (Leibnitz rule), quotient, and chain rule',
        'Differentiation of composite, implicit, parametric, and inverse trigonometric functions',
        'Logarithmic differentiation',
        'Second-order and higher-order derivatives'
      ]
    },
    {
      chapter: 'Applications of Derivatives (AOD)',
      concepts: [
        'Rate of change of quantities',
        'Strictly increasing and decreasing functions, and monotonic intervals using the first derivative test',
        'Tangents and normals: Slopes and equations to curves',
        'Rolle’s Theorem and Lagrange’s Mean Value Theorem (LMVT) and geometric interpretations',
        'Maxima and minima: Local extrema, first and second derivative tests, and absolute extrema on closed intervals',
        'Practical optimization problems'
      ]
    },
    {
      chapter: 'Indefinite Integration',
      concepts: [
        'Integration as the inverse process of differentiation',
        'Standard elementary integrals',
        'Integration by substitution',
        'Integration using trigonometric identities',
        'Integration by partial fractions',
        'Integration by parts (∫ u v dx)',
        'Special algebraic integrals (∫ dx/(x² ± a²), ∫ dx/√(a² - x²), ∫ √(a² ± x²) dx)'
      ]
    },
    {
      chapter: 'Definite Integration',
      concepts: [
        'Fundamental Theorem of Calculus',
        'Standard properties of definite integrals (∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx, even/odd properties, periodic properties)',
        'Definite integral as the limit of a Riemann sum'
      ]
    },
    {
      chapter: 'Applications of Integrals (Area Under Curves)',
      concepts: [
        'Area bounded by standard curves (lines, circles, parabolas, ellipses)',
        'Area enclosed between two intersecting curves'
      ]
    },
    {
      chapter: 'Differential Equations',
      concepts: [
        'Order and degree of a differential equation',
        'Formation of differential equations (CET focus)',
        'General and particular solutions of differential equations',
        'First-order, first-degree differential equations: Variable separable method',
        'Homogeneous differential equations',
        'Linear differential equations of the form dy/dx + Py = Q using Integrating Factor (I.F. = e^∫P dx)'
      ]
    },
    {
      chapter: 'Vector Algebra',
      concepts: [
        'Vectors and scalars, magnitude, direction, direction cosines, and direction ratios',
        'Types of vectors: Zero, unit, collinear, equal, and coplanar vectors',
        'Position vector, vector addition, and section formula',
        'Scalar (dot) product of vectors, projection of a vector on a line, and orthogonality condition',
        'Vector (cross) product of vectors and applications to areas of triangles and parallelograms',
        'Scalar triple product ([a b c]) and volume of a parallelepiped'
      ]
    },
    {
      chapter: 'Three-Dimensional Geometry (3D)',
      concepts: [
        'Coordinate axes, coordinates of a point, distance formula, and section formula in 3D',
        'Direction cosines (l, m, n) and direction ratios (a, b, c) of a line',
        'Angle between two intersecting lines',
        'Vector and Cartesian equations of a straight line in space (passing through a point and parallel to a vector; passing through two points)',
        'Coplanarity of lines, skew lines, and shortest distance between skew lines',
        'Planes (CET syllabus): Equations of a plane (normal form, passing through three points, intercept form), distance of a point from a plane, and angle between a line and a plane'
      ]
    },
    {
      chapter: 'Linear Programming (CET Exclusive)',
      concepts: [
        'Formulation of Linear Programming Problems (LPP)',
        'Constraints, objective function, decision variables, and non-negativity restrictions',
        'Graphical solution of two-variable LPP: Feasible and infeasible regions, bounded and unbounded regions',
        'Corner point method to find optimal (maximum and minimum) solutions'
      ]
    },
    {
      chapter: 'Statistics',
      concepts: [
        'Measures of central tendency: Mean, median, and mode for grouped and ungrouped data',
        'Measures of dispersion: Range, mean deviation about mean, and mean deviation about median',
        'Variance and standard deviation (σ) for grouped and ungrouped data',
        'Coefficient of variation and analysis of frequency distributions'
      ]
    },
    {
      chapter: 'Probability',
      concepts: [
        'Random experiments, sample space, events, mutually exclusive, and exhaustive events',
        'Classical and axiomatic definitions of probability, addition theorem (P(A ∪ B))',
        'Conditional probability (P(A|B)), multiplication rule, and independent events',
        'Law of Total Probability and Bayes’ Theorem',
        'Random variables and probability distributions: Probability mass function (p.m.f.), cumulative distribution function (c.d.f.)',
        'Expected value (mean) and variance of a discrete random variable',
        'Bernoulli trials and Binomial distribution: P(X = r) = ⁿCᵣ pʳ qⁿ⁻ʳ, mean (np), and variance (npq)'
      ]
    }
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
