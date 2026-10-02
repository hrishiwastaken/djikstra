# Dijkstra

## Adaptive JEE/CET Preparation & Performance Analysis System

**Product Specification — v1.1**
**Date:** October 2026
**Platform:** Web Application
**Backend:** Python
**Primary purpose:** Digitize, analyze, and continuously improve a student's JEE/CET preparation process.

---

# 1. Product Vision

Dijkstra is a personal preparation-management system designed around a simple principle:

> **Don't optimize the timetable. Optimize the feedback loop.**

The system treats competitive-exam preparation as an engineering/control problem.

The student continues to maintain a physical notebook for writing down mistakes, explanations, conceptual discoveries, and learning observations. This physical process is intentional: writing forces reconstruction of the mistake and reinforces learning.

Dijkstra acts as the **digital partner** to that physical process.

It should:

- digitize daily preparation analysis from photographs;
- maintain a persistent record of preparation;
- calculate objective performance metrics;
- track progress globally, by exam, subject, chapter, and concept;
- distinguish JEE and CET preparation;
- account for variable daily study availability;
- detect recurring weaknesses;
- analyze time-management and question-selection behavior;
- compare weekly preparation against previous weeks;
- use the weekly benchmark test as the principal feedback signal;
- use AI to infer patterns that are difficult to encode deterministically;
- recommend what should receive attention next;
- produce detailed weekly reports.

The application is **not intended to replace the student's notebook**.

The notebook captures the student's thinking.

Dijkstra captures the longitudinal data.

---

# 2. Core Philosophy

The preparation system follows:

> **Attempt → Measure → Diagnose → Repair → Retest → Adapt**

The student's original preparation model defines:

- **Plant:** current knowledge and problem-solving ability
- **Input:** practice, theory, revision
- **Sensors:** timed tests and performance data
- **Error signal:** wrong answers, guesses, time losses, conceptual failures, execution failures, selection failures
- **Controller:** study decisions
- **Feedback:** results of subsequent tests

Dijkstra digitizes this feedback loop.

The system should therefore optimize **learning velocity and reliability**, not simply study hours or question count.

---

# 3. Scope

## 3.1 Exams

The system supports two preparation modes:

- JEE
- CET

The application must understand that they are related but distinct preparation environments.

Differences include:

- speed;
- difficulty distribution;
- question style;
- calculation speed;
- time pressure;
- exam strategy.

The underlying curriculum should therefore be shared while performance measurements remain tagged by examination context.

---

# 4. Product Execution Modes

Dijkstra supports two runtime execution modes controlled by a **dynamic Feedback Loop switch**.

The switch is a user-facing control that determines how much processing occurs when a daily submission is submitted. It is not a different application or a separate MVP build. The underlying data model remains identical; only the post-submission task pipeline changes.

## 4.1 Feedback Loop ON

When enabled, submission triggers the complete working feedback loop:

```text
Submit Day
    ↓
Validate input
    ↓
Process notebook images
    ↓
AI extraction
    ↓
Schema + semantic validation
    ↓
Human confirmation
    ↓
Persist canonical records
    ↓
Update deterministic analytics
    ↓
Update current-week dataset
    ↓
Run applicable adaptive analysis
    ↓
Refresh recommendations / priorities
```

The exact tasks may execute synchronously or asynchronously depending on implementation, but the user should be able to see the processing state and any failures.

## 4.2 Feedback Loop OFF

When disabled, submission performs only the minimum reliable persistence workflow:

```text
Submit Day
    ↓
Validate input
    ↓
Process / extract only what is explicitly required
    ↓
Human confirmation where AI extraction is used
    ↓
Persist canonical records
    ↓
Basic deterministic statistics
```

Expensive or non-essential downstream analysis is deferred. This allows the user to enter data without immediately invoking the complete AI analysis pipeline.

The switch should be visible near the submission action and its current state should be stored with the submission so historical processing behavior is auditable.

## 4.3 Why the switch exists

The switch provides an explicit tradeoff between **fast capture** and **full feedback**.

A user may turn the loop off when they simply want to record a day, test the application, conserve model/API usage, or process several days before running deeper analysis. They may turn it on when they want the submission to immediately participate in the full adaptive system.

The system must never silently change modes.

# 5. JEE/CET Weekly Allocation

Each preparation week is assigned a deliberate JEE\:CET allocation.

Allowed weekly allocations:

```text
5:0
4:1
3:2
2:3
1:4
0:5

```

where:

```text
JEE : CET

```

The allocation is not a permanent timetable.

It is a controllable variable that can change as exam dates approach and as performance data changes.

The application must store the allocation explicitly.

Example:

```json
{
  "jee_days": 3,
  "cet_days": 2,
  "ratio": "3:2"
}

```

The application should later be capable of comparing historical performance against different allocations.

Example:

> During 3:2 weeks, JEE performance changed by X while CET performance changed by Y.

This is an analytical observation, not an assumption that a particular ratio is inherently optimal.

---

# 6. Weekly Structure

The fundamental organizational unit is a **Preparation Cycle / Week**.

```text
Preparation
│
├── Week 01
│   ├── Allocation
│   ├── Daily Sessions
│   ├── Daily Error Analyses
│   ├── Running Statistics
│   └── Weekly Benchmark
│
├── Week 02
│   ├── Allocation
│   ├── Daily Sessions
│   ├── Daily Error Analyses
│   ├── Running Statistics
│   └── Weekly Benchmark
│
└── ...

```

Each week contains:

1. JEE\:CET allocation
2. Daily preparation sessions
3. Study-time records
4. Question-attempt records
5. Daily error analyses
6. Subject/chapter/concept observations
7. Derived statistics
8. A conclusive weekly test
9. Weekly AI analysis
10. Recommendations / next-week priorities

---

# 7. Weekly Benchmark Test

Every week ends with a conclusive benchmark test.

The benchmark alternates between:

- JEE
- CET

Example:

```text
Week 1 → JEE
Week 2 → CET
Week 3 → JEE
Week 4 → CET
...

```

The benchmark is a first-class data object rather than merely another daily test.

Its purpose is to measure the result of the week's preparation and provide a consistent longitudinal signal.

For JEE, the benchmark may follow the established 75-question structure:

```text
Physics      25 questions / 1 hour
Chemistry    25 questions / 1 hour
Mathematics  25 questions / 1 hour

Total        75 questions / 3 hours

```

The system must remain configurable so that the benchmark format can change without changing the underlying data architecture.

The weekly report should place the benchmark beside the week's accumulated daily data.

---

# 8. Daily Session

A daily submission records what actually happened that day.

A day must **not** be judged solely against a fixed question target.

The student may have:

- normal school;
- school-sponsored mock examinations;
- unusually heavy school work;
- travel;
- other unavoidable constraints.

Therefore the system records three separate quantities:

```text
Available time
Actual study time
Target study time

```

These must never be conflated.

Example:

```json
{
  "target_hours": 6.0,
  "available_hours": 4.0,
  "actual_study_hours": 3.7
}

```

This allows the system to distinguish:

- insufficient available time;
- failure to use available time;
- successful execution under difficult constraints.

---

# 9. Daily Context

Each day may have a context/type:

```text
NORMAL
SCHOOL_HEAVY
SCHOOL_TEST
HOLIDAY
OTHER_CONSTRAINT

```

The student may also enter free-form context.

Example:

```json
{
  "day_type": "SCHOOL_TEST",
  "context": "School-sponsored mock test consumed approximately 3 hours."
}

```

This contextual information is important when interpreting weekly trends.

A lower question count on a constrained day should not automatically be interpreted as poor productivity.

---

# 10. Daily Quantitative Data

Each day records:

### Time

- target study hours;
- available study hours;
- actual study hours;
- testing time;
- analysis/review time;
- optional additional study time.

### Questions

- questions attempted;
- questions correct;
- questions incorrect;
- questions skipped;
- optionally guessed questions;
- optionally high-uncertainty questions.

### Exam context

- JEE or CET;
- subject;
- test type;
- session identifier.

The program derives:

```math
\text{questions/hour} = \frac{\text{questions attempted}} {\text{actual study hours}}
```

and similar efficiency metrics.

Raw data should always be preserved.

---

# 11. Daily Error Analysis

After completing daily practice, the student performs error analysis in a physical notebook.

The student follows a strict standardized format.

The photographs submitted to Dijkstra contain this analysis.

The photographs do **not** primarily contain the original exam questions.

They contain the student's interpretation of:

- what concepts went wrong;
- why they went wrong;
- how they went wrong;
- what was learned;
- time-management problems;
- question-selection problems;
- recurring patterns;
- other useful observations.

This distinction is fundamental.

Dijkstra is digitizing **metacognitive analysis**, not merely OCRing exam answers.

---

# 12. Error Classification

The initial classification system is:

## Concept Gap

The underlying theory was not known or understood.

Action:

> Learn/revise the theory.

## Application Gap

The theory was known but could not be correctly applied.

Action:

> Practice similar applications and develop recognition.

## Execution Error

The intended method was known but execution failed.

Examples:

- algebra;
- sign;
- calculation;
- unit;
- substitution;
- arithmetic;
- careless reading.

## Selection Error

The student selected a poor question to spend time on.

Example:

> Spending eight minutes on a problem that should have been abandoned after one or two minutes.

Action:

> Improve question-selection and time-allocation instincts.

## Confidence / Uncertainty

The student may optionally record:

- guessed correct;
- guessed incorrect;
- uncertain but correct;
- uncertain and incorrect.

This should be preserved separately because correctness alone can produce misleading confidence.

---

# 13. Time-Based Analysis

Time is a first-class component of preparation.

The system should support observations such as:

```text
question took too long

```

```text
spent too long before abandoning

```

```text
easy question skipped

```

```text
correct but inefficient

```

```text
incorrect because of time pressure

```

The application should eventually be capable of distinguishing:

```math
\text{knowledge failure}
```

from

```math
\text{time/decision failure}
```

This is especially important because JEE preparation is not merely about whether a question can eventually be solved.

The relevant question is:

> **Was solving this question worth the time spent on it?**

---

# 14. Canonical Curriculum Data Structure

The curriculum should exist once.

JEE and CET should not have duplicate chapter trees.

Conceptually:

```text
Curriculum
│
├── Physics
│   ├── Electrostatics
│   │   ├── Electric Field
│   │   ├── Gauss Law
│   │   └── Potential
│   │
│   └── Rotational Motion
│       ├── Torque
│       ├── Rolling
│       └── Angular Momentum
│
├── Chemistry
│   ├── Haloalkanes
│   ├── Alcohols
│   └── Amines
│
└── Mathematics
    ├── Integration
    ├── Coordinate Geometry
    └── Probability

```

Performance observations are then tagged with:

```text
exam_context = JEE / CET

```

This permits questions such as:

> How well do I understand Integration?

and:

> How well do I perform Integration under JEE conditions?

and:

> How does my CET performance on Integration compare with JEE?

---

# 15. Data Architecture

The system should be relational or otherwise strongly structured.

A recommended conceptual schema:

```text
USER
 └── PREPARATION
      │
      ├── WEEKS
      │    │
      │    ├── allocation
      │    ├── benchmark
      │    └── sessions
      │
      ├── SESSIONS
      │    │
      │    ├── time data
      │    ├── question data
      │    ├── exam context
      │    └── error analysis
      │
      ├── ERROR_RECORDS
      │
      ├── PERFORMANCE_OBSERVATIONS
      │
      ├── AI_INFERENCES
      │
      └── RECOMMENDATIONS

```

---

# 16. Core Entities

## User

```text
id
name
timezone
created_at

```

## PreparationWeek

```text
id
start_date
end_date

jee_days
cet_days
allocation_ratio

benchmark_exam
benchmark_id

status

```

## StudyDay

```text
id
week_id
date

exam_focus

day_type
context

target_hours
available_hours
actual_hours

testing_hours
analysis_hours
other_study_hours

questions_attempted
questions_correct
questions_wrong
questions_skipped

```

## ErrorRecord

```text
id
study_day_id

subject
chapter
concept

error_type

description
why_it_happened
correct_understanding

time_lost_seconds
confidence_level

source_image_id
created_at

```

## BenchmarkTest

```text
id
week_id

exam_type

total_questions
attempted
correct
wrong
skipped

score
maximum_score

duration

subject_results
chapter_results
error_records

```

## PerformanceObservation

Derived rather than manually entered.

```text
id

scope
scope_id

period

attempts
accuracy
average_time

concept_errors
application_errors
execution_errors
selection_errors

trend

```

Scopes include:

```text
GLOBAL
EXAM
SUBJECT
CHAPTER
CONCEPT

```

---

# 17. Raw vs Derived vs Inferred Data

This separation is mandatory.

## Layer 1 — Raw

What the student actually entered or what the model extracted.

Example:

```text
"I kept choosing the wrong equation to start with."

```

## Layer 2 — Normalized

Structured interpretation.

```text
error_type = APPLICATION
concept = ELECTROSTATICS

```

## Layer 3 — Derived

Calculated by the application.

```text
application_errors += 1
accuracy = 72.4%
rolling_14_day_accuracy = 75.1%

```

## Layer 4 — AI Inference

Interpretation.

```text
"Repeated application failures may indicate difficulty translating
physical situations into mathematical representations."

```

These layers must not be merged.

This provides traceability when an AI conclusion turns out to be wrong.

---

# 18. Evidence Provenance

Every AI-generated interpretation must retain a traceable evidence chain.

The system should be able to answer:

> **Why does Dijkstra believe this?**

A diagnosis should trace through:

```text
AI Diagnosis
    ↓
supporting Performance Observations
    ↓
normalized Error Records
    ↓
raw student observations
    ↓
original notebook photograph / source input
```

For example, a statement such as `Integration is a persistent weakness` should be backed by the underlying attempts, accuracy, error records, time information, confidence observations, and historical trend that produced the diagnosis.

The provenance system must distinguish:

- **source evidence** — what the student entered or what the extraction model observed;
- **normalized evidence** — structured records derived from that source;
- **computed evidence** — deterministic statistics calculated by the application;
- **AI inference** — an interpretation made from those evidence layers.

AI inferences must never overwrite or mutate historical measurements. If a model or prompt changes, the inference may be regenerated while the underlying evidence remains intact.

This makes AI conclusions inspectable, debuggable, and replaceable.

# 19. AI Responsibility

AI should **not** perform the core analytics.

The application owns:

- arithmetic;
- aggregation;
- counting;
- database queries;
- trends;
- rolling averages;
- ratios;
- comparisons;
- thresholds;
- historical lookup;
- data validation.

AI owns:

- interpreting natural-language observations;
- identifying relationships that are difficult to encode;
- diagnosing likely failure mechanisms;
- distinguishing plausible explanations;
- identifying recurring patterns;
- prioritizing weaknesses;
- generating study recommendations;
- producing narrative reports.

The principle is:

> **Program = What happened.**
>
> **AI = What might it mean.**

---

# 20. AI Pipeline

There should be two logically separate AI operations.

## Stage A — Image Extraction

Input:

- one or more daily-analysis photographs;
- strict format definition;
- curriculum vocabulary;
- expected JSON schema.

Output:

```json
{
  "records": [
    {
      "subject": "Physics",
      "chapter": "Rotational Motion",
      "concept": "Rolling",
      "error_type": "application",
      "what_went_wrong": "...",
      "why": "...",
      "correct_understanding": "...",
      "time_issue": true
    }
  ]
}

```

The model must not invent missing information.

Unknown fields should be:

```text
null

```

rather than guessed.

The backend validates the returned structure before storing it.

---

# 21. Stage B — Analytical Reasoning

The program first computes the week's analytical dataset.

Example:

```json
{
  "week": "2026-W40",

  "allocation": "3:2",

  "study": {
    "target_hours": 30,
    "available_hours": 27,
    "actual_hours": 25.4,
    "questions": 412
  },

  "performance": {
    "jee": {...},
    "cet": {...}
  },

  "chapter_changes": [...],

  "error_distribution": {...},

  "time_patterns": {...},

  "historical_comparison": [...],

  "benchmark": {...},

  "qualitative_observations": [...]
}

```

The AI receives this rather than the entire database.

---

# 22. AI Analysis Prompt Architecture

The system prompt should establish a strict boundary:

```text
You are the analytical reasoning layer of a competitive-exam
preparation system.

The application has already calculated all numerical metrics.

Do not recalculate metrics.
Do not invent missing data.
Do not treat correlation as causation.
Do not state an inference as a fact.

Your task is to:

1. identify meaningful patterns;
2. explain plausible causes;
3. distinguish persistent weaknesses from temporary fluctuations;
4. distinguish conceptual problems from application, execution,
   selection, and time-management problems;
5. identify contradictions between qualitative observations and
   quantitative performance;
6. prioritize issues that are likely to produce meaningful improvement;
7. recommend concrete next actions.

Use only the supplied evidence.

Every important inference should include:
- evidence;
- interpretation;
- confidence.

When evidence is insufficient, explicitly say so.

```

---

# 23. Weekly AI Output Schema

The AI should return structured data.

```json
{
  "summary": "...",

  "major_observations": [
    {
      "observation": "...",
      "evidence": ["..."],
      "confidence": 0.87
    }
  ],

  "diagnoses": [
    {
      "subject": "Physics",
      "chapter": "Rotational Motion",
      "issue": "...",
      "type": "application",
      "confidence": 0.84
    }
  ],

  "persistent_weaknesses": [],

  "improving_areas": [],

  "concerning_changes": [],

  "recommended_priorities": [
    {
      "subject": "Mathematics",
      "chapter": "Integration",
      "focus": "application",
      "priority": "high",
      "reason": "..."
    }
  ],

  "next_week_experiment": {
    "hypothesis": "...",
    "intervention": "...",
    "measurement": "..."
  }
}

```

The final `next_week_experiment` field is particularly important.

The system should encourage interventions that can subsequently be evaluated.

---

# 24. Weekly Report

At the end of every week, Dijkstra generates a detailed report containing:

## Executive Summary

A concise explanation of the week's performance.

## Time

- planned time;
- available time;
- actual time;
- utilization;
- constrained days.

## Volume

- questions attempted;
- questions analyzed;
- questions/hour;
- subject distribution.

## Performance

- overall;
- JEE;
- CET;
- Physics;
- Chemistry;
- Mathematics.

## Error Analysis

- concept;
- application;
- execution;
- selection;
- confidence/uncertainty.

## Chapter Analysis

Top weaknesses and strongest areas.

## Historical Comparison

Compare with:

- previous week;
- previous 2–4 weeks;
- longer-term baseline.

## Weekly Benchmark

Compare the conclusive test against:

- previous benchmark of the same exam type;
- recent daily performance;
- expected/target performance.

## AI Diagnosis

Explain what the combined data appears to mean.

## Recommended Next Actions

Produce prioritized actions for the next cycle.

---

# 25. Benchmark Interpretation

The weekly benchmark should be treated as a high-value signal but not the only signal.

A weekly score can fluctuate because of:

- question-set difficulty;
- fatigue;
- unusual topic distribution;
- random variation;
- external circumstances.

Therefore the system should combine:

```text
daily observations
+
weekly benchmark
+
historical trend

```

rather than allowing one test to completely determine the diagnosis.

---

# 26. Performance Metrics

The application should calculate metrics at:

```text
Overall
JEE
CET
Physics
Chemistry
Mathematics
Chapter
Concept

```

Potential metrics include:

### Accuracy

```math
A = \frac{\text{correct}}{\text{attempted}}
```

### Attempt rate

```math
R_a = \frac{\text{attempted}}{\text{available questions}}
```

### Question throughput

```math
Q_h = \frac{\text{questions attempted}}{\text{study hours}}
```

### Error rate

```math
E = \frac{\text{errors}}{\text{attempted}}
```

### Error-type distribution

```text
concept %
application %
execution %
selection %

```

### Time efficiency

```text
average time/question
average time/correct question
time spent on incorrect questions

```

### Trend metrics

```text
7-day
14-day
30-day
weekly benchmark trend

```

All mathematical metrics are generated by the application, not the LLM.

---

# 27. Confidence Analysis

The system should distinguish:

```text
correct + confident
correct + uncertain
wrong + confident
wrong + uncertain

```

This creates a more useful model of knowledge than accuracy alone.

Examples:

```text
Correct + uncertain
→ possible lucky success

Wrong + confident
→ dangerous misconception

Wrong + uncertain
→ known weakness

Correct + confident
→ reliable knowledge

```

The AI can interpret these patterns, while the program calculates their frequencies.

---

# 28. Adaptive Learning Model

The system should eventually support a priority score for each concept.

The score itself should initially be deterministic.

Possible inputs:

```text
error frequency
recency
accuracy
trend
time cost
importance
confidence
repetition

```

For example:

```math
P_c = w_1E+ w_2R+ w_3T+ w_4S+ w_5I
```

where the exact weighting should remain configurable.

The AI does not need to invent the numerical score.

Instead, it receives the ranked candidates and determines **why** a candidate deserves attention and what intervention may address it.

---

# 29. Exploration vs Exploitation

The system should not exclusively chase current weaknesses.

A proposed default is:

```text
70–80% diagnosed weaknesses
20–30% exploration

```

This prevents the adaptive system from becoming myopic.

Exploration may include:

- chapters not recently tested;
- mixed problems;
- older material;
- unfamiliar question types.

This preserves broad syllabus coverage.

---

# 30. JEE/CET Interaction

JEE and CET preparation should share knowledge infrastructure but maintain separate performance contexts.

The system should therefore be able to answer:

> What concepts are weak regardless of exam?

and:

> What weaknesses only appear under JEE conditions?

and:

> What weaknesses only appear under CET speed requirements?

This distinction is critical.

A student could have:

```text
Conceptual knowledge: strong
JEE application: weak
CET speed: strong

```

and that is very different from:

```text
Conceptual knowledge: weak
JEE application: weak
CET speed: weak

```

---

# 31. User Interface

The application should be visually appealing, modern, and information-dense without becoming cluttered.

Recommended design language:

- dark/light theme;
- clean cards;
- subtle animations;
- strong typography;
- graphs;
- progress rings;
- heatmaps;
- trend lines;
- chapter maps;
- weekly timelines;
- clear color semantics;
- responsive desktop-first design.

The visual identity should feel more like a **technical control dashboard** than a generic productivity application.

---

# 32. Dashboard

The primary dashboard should answer:

> **How am I doing right now?**

Suggested components:

### Overall Performance

```text
Current performance
Trend
Study hours
Questions
Accuracy

```

### Current Week

```text
JEE:CET = 3:2

████████████████░░░░

22.4 / 30 target hours

```

### Weakness Map

A chapter heatmap:

```text
             Physics Chemistry Mathematics

Electrostatics     🟢      —          —
Rotation           🔴      —          —
Organic            —       🟢         —
Integration        —       —          🔴
Probability        —       —          🟠

```

### Error Distribution

A stacked chart:

```text
Concept       18%
Application   37%
Execution     16%
Selection     29%

```

### Latest Benchmark

```text
JEE
187 / 300

↑ 13 from previous JEE benchmark

```

---

# 33. Weekly Report UI

The weekly report should feel like an engineering review.

Sections:

```text
WEEKLY REVIEW
────────────────────────────

System Status

Time
Performance
Errors
Efficiency

↓


WHAT HAPPENED

↓


WHAT CHANGED

↓


WHY IT PROBABLY CHANGED

↓


WHAT SHOULD CHANGE NEXT

↓


NEXT WEEK EXPERIMENT

```

The AI-generated sections should be visually distinguished from programmatically calculated facts.

For example:

**Measured**

> Mathematics accuracy decreased 6.2 percentage points.

**Inference**

> The decrease appears more strongly associated with application and selection errors than conceptual errors.

This prevents the AI from being mistaken for the source of truth.

---

# 34. Daily Submission UX

The daily workflow should be extremely fast.

```text
+ New Day

```

### Page

```text
Date
Exam Focus
Day Type

Available Time
Actual Study Time

Questions Attempted
Correct
Wrong
Skipped

[ Upload Error Analysis ]

[ Process ]

[ Review Extracted Data ]

[ Save Day ]

```

After AI extraction:

```text
AI extracted 8 observations.

✓ Physics / Rotational Motion / Rolling
✓ Physics / Electrostatics / Gauss Law
✓ Mathematics / Integration
...

```

The user must be able to edit every extracted field before committing it to the database.

**Human confirmation is required before AI-extracted data becomes canonical data.**

---

# 35. Image Processing Pipeline

```text
Upload
 ↓
Image preprocessing
 ↓
Vision model
 ↓
Structured extraction
 ↓
Schema validation
 ↓
User review
 ↓
Database

```

Potential preprocessing:

- crop;
- rotation correction;
- contrast normalization;
- image compression;
- multi-page ordering.

The original photograph should remain stored alongside the extracted record.

---

# 36. Model Strategy

The architecture must make the AI provider replaceable.

Create an abstraction:

```python
class VisionProvider:
    def extract_daily_analysis(...):
        ...

class ReasoningProvider:
    def analyze_week(...):
        ...

```

The rest of the application should never depend directly on a specific vendor.

---

# 37. Recommended Initial Model

## Extraction

**Primary candidate: Qwen3-VL-8B-Instruct / Thinking variant**

Qwen3-VL currently advertises expanded OCR, 32-language support, stronger visual reasoning, long-context document understanding, and STEM reasoning. The 8B model is also available as open weights under Apache 2.0.

This makes it a strong fit for the standardized notebook-photo extraction stage.

However, because the notebook format is intentionally constrained, the final choice should be determined through an evaluation set of real photographs rather than benchmark reputation alone.

## OCR-specialist fallback

**GLM-OCR**

GLM-OCR is a 0.9B multimodal OCR model designed for document understanding, information extraction, formulas and tables. Its Hugging Face documentation reports 94.62 on OmniDocBench V1.5.

It is worth benchmarking specifically for the extraction stage.

---

# 38. Recommended Reasoning Model

The reasoning model should be evaluated separately from the OCR model.

The important criteria are:

1. ability to follow analytical constraints;
2. ability to reason over structured longitudinal data;
3. ability to distinguish observation from inference;
4. consistency of recommendations;
5. structured JSON output;
6. low hallucination rate.

A strong hosted reasoning model can initially be used as the benchmark.

The architecture should allow switching between:

```text
Gemini
Qwen
other hosted model
local model

```

without modifying the application.

---

# 39. API / Free-Tier Strategy

Free API availability should **not** be treated as an architectural dependency.

OpenRouter currently offers a changing collection of free models and routes requests through available providers, but free availability can change over time.

Gemini currently provides free-tier access for some models and supports structured JSON outputs using JSON Schema. Google's documentation specifically recommends application-side validation because schema-valid output can still be semantically incorrect.

Therefore:

### Development

Use whichever free multimodal API currently provides sufficient quality.

### Production

Keep the provider abstracted so that the application can switch providers or move extraction locally.

### Long-term

Potentially self-host the extraction model.

Qwen3-VL-8B has documented local deployment paths through Transformers/vLLM and exposes an OpenAI-compatible serving pattern.

---

# 40. Prompt Versioning

Prompts should be version-controlled.

Example:

```text
prompts/
    daily_extraction_v1.txt
    daily_extraction_v2.txt

    weekly_analysis_v1.txt
    weekly_analysis_v2.txt

```

Every AI inference should store:

```text
model
prompt_version
timestamp
input_data_version
output

```

This allows the system to determine whether a change in AI behavior resulted from:

- new model;
- new prompt;
- new data;
- different context.

---

# 41. AI Reliability

The system must never silently trust AI output.

Every extraction passes through:

```text
Model output
 ↓
Schema validation
 ↓
Semantic validation
 ↓
User confirmation
 ↓
Database

```

For analytical recommendations:

```text
AI inference
 ↓
Store as inference
 ↓
Do not overwrite measured data

```

AI conclusions must never modify historical measurements.

---

# 42. Weekly Control Loop

The complete system is:

```text
                    DAILY
                      │
                      ▼
                 Take tests
                      │
                      ▼
                Analyze errors
                      │
                      ▼
              Write notebook
                      │
                      ▼
             Photograph analysis
                      │
                      ▼
                Dijkstra OCR
                      │
                      ▼
             Structured records
                      │
                      ▼
              Database update
                      │
                      ▼
                 Statistics
                      │
                      │
                      ▼
                    WEEK
                      │
                      ▼
            Conclusive benchmark
                      │
                      ▼
             Weekly aggregation
                      │
                      ▼
               AI interpretation
                      │
                      ▼
               Weekly report
                      │
                      ▼
             Next-week priorities
                      │
                      ▼
                  NEW WEEK

```

This is the core product loop.

---

# 43. Future Weekly Experimentation

Dijkstra should eventually treat preparation changes as experiments.

Example:

```text
Hypothesis:
Increasing CET practice from 2 days to 3 days will improve
CET speed without significantly damaging JEE performance.

Intervention:
Change allocation from 3:2 → 2:3.

Measurements:
CET benchmark
JEE benchmark
questions/hour
error distribution
chapter performance

Evaluation:
Compare with previous baseline.

```

This turns preparation into an evolving empirical system rather than a fixed timetable.

---

# 44. Longitudinal Analytics

The application should eventually answer:

### Overall

> How has my preparation evolved?

### Subject

> Which subject is improving fastest?

### Chapter

> Which chapters continue to leak marks?

### Concept

> Which concepts repeatedly generate errors?

### Exam

> How is JEE performance changing independently of CET?

### Time

> Am I becoming faster?

### Reliability

> Are correct answers becoming more confident?

### Strategy

> Are selection errors decreasing?

### Allocation

> What happened when my JEE\:CET allocation changed?

---

# 45. Important Design Principle

The system should preserve **evidence**, not merely conclusions.

Do not store only:

```text
"Integration is weak."

```

Store:

```text
attempts
accuracy
error records
time
confidence
historical trend
qualitative observations
AI inference

```

Then the conclusion can always be regenerated.

This makes the system resilient to changes in:

- AI models;
- prompts;
- scoring formulas;
- priorities;
- exam strategy.

---

# 46. Security and Privacy

The application contains personal educational data.

Minimum requirements:

- API keys stored server-side only;
- never expose provider API keys to browser JavaScript;
- authentication;
- encrypted transport;
- secure image storage;
- database access control;
- backups;
- deletion/export functionality;
- clear retention policy for uploaded photographs.

The frontend should communicate only with the Python backend.

---

# 47. Recommended Technology Stack

## Frontend

A modern web frontend:

```text
React / Next.js
TypeScript
Tailwind CSS
Charting library

```

The frontend should prioritize responsive dashboards and high-quality data visualization.

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy

```

FastAPI provides a clean API layer and Pydantic is particularly suitable for validating both user submissions and AI-generated structured records.

## Database

Development:

```text
SQLite

```

Production / larger deployment:

```text
PostgreSQL

```

## Background processing

For asynchronous AI processing:

```text
Celery / RQ / lightweight async task queue

```

The first version can use FastAPI background tasks if the workload remains small.

## File storage

Development:

```text
local storage

```

Production:

```text
S3-compatible object storage

```

---

# 48. API Endpoints

Conceptually:

```text
POST   /weeks
GET    /weeks
GET    /weeks/{id}

POST   /study-days
GET    /study-days/{id}
PATCH  /study-days/{id}

POST   /study-days/{id}/images
POST   /study-days/{id}/extract

GET    /performance/overall
GET    /performance/subject/{subject}
GET    /performance/chapter/{chapter}
GET    /performance/concept/{concept}

GET    /analytics/current-week
GET    /analytics/history

POST   /weekly-report/{week_id}/generate
GET    /weekly-report/{week_id}

GET    /recommendations

```

---

# 49. MVP Components

The following components constitute the first practical implementation. The dynamic Feedback Loop switch determines which downstream tasks run immediately on submission.

The first version should **not** require the entire theoretical system to be fully automated.

MVP:

### 1. Daily submission

- time;
- questions;
- JEE/CET;
- upload notebook image.

### 2. AI extraction

- structured error records;
- user confirmation.

### 3. Database

- days;
- weeks;
- subjects;
- chapters;
- errors.

### 4. Quantitative dashboard

- hours;
- questions;
- accuracy;
- error types;
- chapter performance.

### 5. Weekly benchmark

- JEE/CET;
- score;
- subject breakdown.

### 6. Weekly AI report

- what happened;
- what changed;
- likely reasons;
- priorities.

Everything else can build on this.

---

# 50. MVP Definition and Working Feedback Loop

The MVP is not a separate reduced architecture. It is the **smallest complete implementation of the core feedback loop**, exposed through the dynamic Feedback Loop switch described in the Product Execution Modes section.

The first implementation should prove one end-to-end loop:

```text
Daily submission
      ↓
Notebook photograph
      ↓
AI extraction
      ↓
Human confirmation
      ↓
Canonical database record
      ↓
Deterministic analytics
      ↓
Weekly dataset
      ↓
AI interpretation
      ↓
Weekly report / next priorities
      ↓
New evidence
```

The application should be considered functionally successful once this loop works reliably on real preparation data. Additional analytics should then be layered on top rather than designed in isolation.

The dynamic Feedback Loop switch controls whether submission immediately executes the complete loop or performs only capture/persistence and basic deterministic processing.

The MVP therefore includes:

1. Daily submission
2. Dynamic Feedback Loop ON/OFF switch
3. Notebook image upload
4. AI extraction
5. Human confirmation
6. Canonical database persistence
7. Deterministic performance statistics
8. Weekly benchmark storage
9. Weekly AI report when the feedback loop is enabled / requested
10. Evidence provenance from AI output back to source records

The MVP deliberately does **not** require every future adaptive-learning feature before the first real-world trial.

# 51. Phase 2

Add:

- confidence analysis;
- time-selection analytics;
- chapter heatmaps;
- historical comparisons;
- JEE/CET allocation analysis;
- benchmark trend analysis;
- experiment tracking.

---

# 52. Phase 3

Add:

- adaptive priority engine;
- automated next-week planning;
- intervention experiments;
- prediction of likely bottlenecks;
- richer concept-level knowledge graph;
- model evaluation dashboard.

---

# 53. First-Loop Acceptance Criteria

Before expanding Dijkstra, the core loop should satisfy these conditions:

- A real notebook photograph can be submitted.
- The extraction model returns schema-valid structured observations.
- The user can inspect and correct every extracted observation.
- Confirmed observations become canonical database records.
- Deterministic metrics are reproducible from stored raw data.
- The system can trace an AI diagnosis back to its supporting evidence.
- Turning Feedback Loop ON triggers the configured downstream analysis.
- Turning Feedback Loop OFF prevents non-essential downstream analysis from running automatically.
- A failed AI task does not corrupt previously stored measurements.
- The user can retry deferred or failed processing later.

This is the first engineering milestone: **one reliable feedback loop before building the larger intelligence layer.**

# 54. Product Success Criteria

Dijkstra succeeds if it reduces the manual overhead of maintaining preparation analytics without reducing the quality of the student's actual reflection.

The core success criteria are:

### Data quality

Daily notebook observations become reliable structured records.

### Analytical quality

The program accurately represents historical performance.

### AI quality

AI produces useful, evidence-grounded interpretations rather than generic motivational advice.

### Decision quality

Recommended interventions target actual bottlenecks.

### Feedback quality

Weekly benchmark results can determine whether interventions worked.

### User friction

Daily digital submission should take only a few minutes.

### Longitudinal value

After months of use, the system should contain a detailed history of:

```text
what was studied
what went wrong
why it went wrong
how often it happened
how much time it cost
what intervention was attempted
what happened afterward

```

---

# 55. Product Identity

## Name

**Dijkstra**

### Meaning

The name references Dijkstra's shortest-path algorithm.

In the preparation system, the "graph" is conceptually:

```text
Current state
     ↓
Weakness
     ↓
Intervention
     ↓
Practice
     ↓
Measurement
     ↓
Improved state

```

There are many possible paths through a syllabus.

Dijkstra's purpose is metaphorically to help identify a productive path through that state space.

The system does not attempt to find a magical shortest path through the syllabus.

It attempts to find a **high-value path through learning and correction** based on observed evidence.

### Possible tagline

> **Dijkstra — Navigate Your Preparation.**

Alternative:

> **Dijkstra — Find the Path to Better Performance.**

Or, more engineering-oriented:

> **Dijkstra — Measure. Diagnose. Adapt.**

The third is the strongest functional description.

---

# 56. Final Product Definition

Dijkstra is not:

- an AI tutor;
- an OCR application;
- a timetable generator;
- a productivity tracker;
- a question bank.

It is a:

> **Personal adaptive preparation instrumentation system.**

Its architecture is deliberately split:

```text
                PHYSICAL NOTEBOOK
                       │
                       │ learning / reflection
                       ▼
                  DAILY PHOTOS
                       │
                       ▼
                 AI EXTRACTION
                       │
                       ▼
              STRUCTURED DATABASE
                       │
                       ▼
             DETERMINISTIC ANALYTICS
                       │
                       ▼
               WEEKLY DATASET
                       │
                       ▼
                 AI INFERENCE
                       │
                       ▼
                WEEKLY REPORT
                       │
                       ▼
              NEXT-WEEK DECISIONS
                       │
                       ▼
                  NEW EVIDENCE
                       │
                       └───────────────┐
                                       │
                                       ▼
                               FEEDBACK LOOP

```

The governing principle is:

```math
\boxed{ \text{Attempt} \rightarrow \text{Measure} \rightarrow \text{Diagnose} \rightarrow \text{Repair} \rightarrow \text{Retest} \rightarrow \text{Adapt} }
```

The application exists to make that loop **visible, measurable, persistent, and increasingly intelligent**.

The student's physical notebook remains the primary medium for thinking.

Dijkstra becomes the analytical memory and feedback system surrounding it.
