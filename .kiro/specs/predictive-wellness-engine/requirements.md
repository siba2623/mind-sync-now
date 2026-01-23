# Predictive Wellness Engine (PWE) - Requirements Document

## Executive Summary

**Feature Name:** Predictive Wellness Engine (PWE)  
**Category:** Preventive Mental Health AI / Digital Phenotyping  
**Target Market:** Health Insurance Providers (Discovery Health Primary)  
**Clinical Framework:** Acceptance and Commitment Therapy (ACT) + Positive Psychology  
**Unique Value Proposition:** Predicts mental health deterioration 3-7 days before clinical symptoms manifest, enabling proactive intervention and reducing hospitalization costs by 40-60%.

---

## 1. Strategic Context

### 1.1 The Insurance Problem
- **Current State:** Mental health claims cost Discovery Health ~R2.8B annually (2025 data)
- **Crisis Hospitalization:** Average cost per psychiatric admission: R45,000-R85,000
- **Preventable Cases:** 60-70% of hospitalizations could be prevented with 48-72 hour early warning
- **Member Churn:** 23% of members cite inadequate mental health support as reason for switching

### 1.2 The Market Gap
Current mental health apps are **reactive** (user reports symptoms after they occur). PWE is **predictive** (detects physiological and behavioral changes before conscious awareness).

**Competitive Analysis:**
- **Headspace/Calm:** Meditation only, no prediction
- **Talkspace/BetterHelp:** Therapy access, no early warning
- **Woebot/Wysa:** Chatbots, reactive support
- **Mindstrong (defunct):** Had digital phenotyping but failed on UX/privacy
- **PWE Advantage:** Combines biometric + behavioral + contextual AI with privacy-first architecture

### 1.3 Clinical Evidence Base
- **HRV & Mood Prediction:** Nocturnal RMSSD reductions predict depressive episodes 5-7 days in advance (Frontiers in Psychiatry, 2025)
- **Keystroke Dynamics:** Typing speed variability correlates with depression severity (r=0.68, p<0.001) (BiAffect Study, 2024)
- **Voice Biomarkers:** Acoustic features predict relapse in bipolar disorder with 82% accuracy (Nature Digital Medicine, 2023)
- **Sleep Fragmentation:** WASO (wake-after-sleep-onset) predicts next-day mood with 76% accuracy (Frontiers in Psychiatry, 2025)

---

## 2. Feature Overview

### 2.1 Core Concept
PWE is an **invisible guardian** that continuously monitors 5 passive data streams to detect subtle changes in mental health status **before** the user experiences distress. When risk is detected, it triggers graduated interventions (from gentle nudges to clinical alerts) based on severity.

### 2.2 The "5-Stream Intelligence Model"

#### Stream 1: Biometric Synchronicity (Wearable Data)
**Data Sources:** Apple Watch, Fitbit, Garmin, Oura Ring, Samsung Health
**Metrics Tracked:**
- Heart Rate Variability (HRV) - specifically nocturnal RMSSD
- Sleep architecture (REM%, deep sleep%, WASO)
- Resting heart rate trends
- Activity patterns (steps, sedentary time)
- Respiratory rate during sleep

**Predictive Signals:**
- ↓ Nocturnal HRV by >15% over 3 days → Depression risk ↑
- ↑ WASO by >20 minutes → Next-day mood deterioration
- ↓ REM sleep <15% → Emotional dysregulation risk
- ↑ Resting HR by >8 bpm sustained → Anxiety/stress escalation

#### Stream 2: Digital Phenotyping (Smartphone Behavior)
**Data Sources:** Keyboard analytics, app usage patterns, screen time
**Metrics Tracked:**
- Typing speed (words per minute)
- Typing variability (coefficient of variation)
- Backspace frequency (error correction)
- Session duration (keyboard engagement time)
- Circadian typing patterns (day vs. night activity)
- App switching frequency (attention fragmentation)

**Predictive Signals:**
- ↑ Typing variability by >30% → Cognitive impairment/depression
- ↓ Typing speed by >25% → Psychomotor retardation
- ↑ Nighttime typing (11pm-3am) → Sleep disruption/mania risk
- ↑ Social media doomscrolling >2hrs/day → Anxiety amplification

#### Stream 3: Voice Biomarkers (Passive Audio Analysis)
**Data Sources:** Voice journal entries, phone calls (with consent), voice assistant interactions
**Metrics Tracked:**
- Pitch variance (prosody)
- Speech rate (syllables per second)
- Pause duration (hesitation patterns)
- Vocal energy (amplitude)
- Jitter/shimmer (voice quality)

**Predictive Signals:**
- ↓ Pitch variance → Flat affect (depression)
- ↓ Speech rate <120 words/min → Psychomotor slowing
- ↑ Pause duration >1.5s → Cognitive fog
- ↓ Vocal energy → Low motivation/fatigue

#### Stream 4: Contextual Intelligence (Environmental Factors)
**Data Sources:** Weather API, calendar events, location patterns, social interactions
**Metrics Tracked:**
- Sunlight exposure (via location + weather)
- Social isolation index (time alone vs. with others)
- Routine disruption score (deviation from baseline)
- Stressor events (work deadlines, financial strain)

**Predictive Signals:**
- <30 min sunlight/day for 5+ days → Seasonal affective risk
- Social isolation >3 days → Loneliness spiral
- Major routine disruption → Stress vulnerability

#### Stream 5: Self-Report Integration (Active Check-ins)
**Data Sources:** Emotion vocabulary selections, PHQ-9/GAD-7 scores, strategy effectiveness ratings
**Metrics Tracked:**
- Emotion category trends (pleasant→unpleasant shift)
- Assessment score trajectories
- Coping strategy engagement (declining usage = red flag)
- Medication adherence patterns

**Predictive Signals:**
- Emotion shift from pleasant_high → unpleasant_low over 4 days
- PHQ-9 score increase of ≥3 points in 2 weeks
- Strategy abandonment (stopped using helpful techniques)

---

## 3. User Stories & Acceptance Criteria

### 3.1 For Members (End Users)

#### User Story 1: Early Warning System
**As a** Discovery Health member with a history of depression  
**I want** to receive gentle alerts when my mental health is declining  
**So that** I can take action before I spiral into a crisis

**Acceptance Criteria:**
- [ ] System detects risk 3-7 days before clinical symptoms manifest
- [ ] Alerts are non-stigmatizing and actionable (e.g., "Your sleep quality has been low. Try a 5-min breathing exercise?")
- [ ] User can dismiss alerts without penalty
- [ ] Alert frequency is adaptive (max 1 per day unless critical)
- [ ] User receives weekly "Wellness Score" summary (0-100 scale)

#### User Story 2: Invisible Monitoring
**As a** busy professional  
**I want** the app to monitor my mental health without requiring daily check-ins  
**So that** I don't feel burdened by another task

**Acceptance Criteria:**
- [ ] 90%+ of data collection is passive (no user action required)
- [ ] Battery drain <5% per day
- [ ] All processing happens on-device (privacy-first)
- [ ] User can view what data is being tracked (transparency)
- [ ] User can disable any data stream at any time

#### User Story 3: Personalized Interventions
**As a** user experiencing early warning signs  
**I want** to receive interventions tailored to my specific risk factors  
**So that** I can address the root cause, not just symptoms

**Acceptance Criteria:**
- [ ] If HRV is low → Recommend stress reduction (breathing, yoga)
- [ ] If sleep is poor → Recommend sleep hygiene strategies
- [ ] If social isolation detected → Suggest reaching out to friends
- [ ] If typing slows → Recommend cognitive stimulation activities
- [ ] Interventions are evidence-based (ACT/CBT/Positive Psychology)

### 3.2 For Discovery Health (Insurance Provider)

#### User Story 4: Risk Mitigation Dashboard
**As a** Discovery Health wellness manager  
**I want** to see aggregated risk trends across my member population  
**So that** I can allocate resources to high-risk cohorts proactively

**Acceptance Criteria:**
- [ ] Dashboard shows: Total members monitored, % at risk, predicted hospitalizations prevented
- [ ] Risk stratification: Low (0-30), Moderate (31-60), High (61-85), Critical (86-100)
- [ ] Cohort analysis: Risk by age, gender, diagnosis, region
- [ ] ROI calculator: Cost of intervention vs. cost of hospitalization avoided
- [ ] HIPAA/POPIA compliant (de-identified data only)

#### User Story 5: Proactive Care Coordination
**As a** Discovery Health case manager  
**I want** to be notified when a member enters high-risk status  
**So that** I can reach out with support before they require hospitalization

**Acceptance Criteria:**
- [ ] Automated alerts to case managers when member risk score >75
- [ ] Alert includes: Risk factors, recommended interventions, member contact info
- [ ] Case manager can initiate outreach via app (in-app message or phone call)
- [ ] Member consent required for case manager access
- [ ] Intervention tracking: Did member engage? Did risk decrease?

#### User Story 6: Cost-Benefit Analytics
**As a** Discovery Health CFO  
**I want** to see the financial impact of PWE  
**So that** I can justify continued investment in the platform

**Acceptance Criteria:**
- [ ] Monthly report: Hospitalizations prevented, cost savings, ROI
- [ ] Benchmark against control group (members without PWE)
- [ ] Predictive accuracy metrics: Sensitivity, specificity, PPV, NPV
- [ ] Member satisfaction scores (NPS)
- [ ] Churn reduction analysis (retention improvement)

### 3.3 For Healthcare Providers (Therapists/Psychiatrists)

#### User Story 7: Clinical Decision Support
**As a** therapist treating a Discovery Health member  
**I want** to see longitudinal biometric and behavioral data  
**So that** I can make more informed treatment decisions

**Acceptance Criteria:**
- [ ] Provider dashboard shows: HRV trends, sleep quality, typing patterns, voice biomarkers
- [ ] Data visualizations: Time-series graphs, correlation heatmaps
- [ ] Medication adherence tracking (if applicable)
- [ ] Treatment response indicators (did intervention work?)
- [ ] Export data for clinical notes (PDF/CSV)

---

## 4. Technical Architecture

### 4.1 Data Collection Layer

#### On-Device Processing (Privacy-First)
**Technology:** CoreML (iOS), TensorFlow Lite (Android)
**Purpose:** All sensitive data processing happens locally on the user's device

**Components:**
- **Biometric Sync Module:** Integrates with HealthKit (iOS) / Google Fit (Android)
- **Keystroke Analytics SDK:** Custom keyboard wrapper (privacy-preserving)
- **Voice Analysis Engine:** On-device speech processing (no audio leaves device)
- **Contextual Data Collector:** Weather API, calendar access (with permission)

**Privacy Guarantees:**
- Raw data never leaves device
- Only aggregated features (e.g., "HRV decreased 15%") sent to cloud
- User can delete all data at any time
- GDPR/POPIA/HIPAA compliant

#### Cloud Analytics Layer
**Technology:** Google Cloud Platform (GCP) or AWS
**Purpose:** Aggregate features, run ML models, generate predictions

**Components:**
- **Feature Store:** Time-series database (InfluxDB or TimescaleDB)
- **ML Pipeline:** TensorFlow/PyTorch models for risk prediction
- **Alert Engine:** Rule-based + ML hybrid system
- **Provider Dashboard:** React + D3.js for data visualization

### 4.2 Machine Learning Models

#### Model 1: Risk Prediction Model
**Type:** Gradient Boosted Trees (XGBoost) + LSTM for time-series
**Inputs:** 50+ features from 5 data streams
**Output:** Risk score (0-100) + confidence interval
**Training Data:** 10,000+ users, 6 months of data
**Performance Target:** 
- Sensitivity: >80% (catch 80% of true positives)
- Specificity: >75% (avoid false alarms)
- Lead time: 3-7 days before clinical symptoms

#### Model 2: Intervention Recommendation Engine
**Type:** Reinforcement Learning (Contextual Bandits)
**Purpose:** Learn which interventions work best for each user
**Inputs:** User profile, current risk factors, past intervention effectiveness
**Output:** Top 3 recommended interventions with expected efficacy
**Personalization:** Model adapts based on user feedback (helpful/not helpful)

#### Model 3: Crisis Triage Agent
**Type:** Large Language Model (LLM) fine-tuned on crisis protocols
**Purpose:** Assess severity of risk and route to appropriate care level
**Inputs:** Risk score, recent behavioral changes, user's crisis history
**Output:** Care level (self-care, peer support, therapist, emergency services)
**Safety:** Human-in-the-loop for critical decisions

### 4.3 Integration Points

#### Wearable Integrations
- **Apple HealthKit:** HRV, sleep, activity, heart rate
- **Google Fit:** Android equivalent
- **Oura Ring API:** Advanced sleep metrics
- **Fitbit API:** Activity and sleep data
- **Garmin Connect:** Stress scores, body battery

#### Healthcare System Integrations
- **Discovery Health API:** Member data, claims history, Vitality points
- **Electronic Health Records (EHR):** HL7 FHIR for provider data exchange
- **Pharmacy Systems:** Medication adherence tracking
- **Telehealth Platforms:** Seamless handoff to video therapy

---

## 5. The Insurance Value Proposition

### 5.1 ROI Model for Discovery Health

#### Cost Savings (Per 10,000 Members)
**Baseline (Without PWE):**
- Mental health hospitalizations per year: 150 (1.5% of members)
- Average cost per hospitalization: R65,000
- Total annual cost: R9,750,000

**With PWE (40% Reduction in Hospitalizations):**
- Hospitalizations prevented: 60
- Cost savings: R3,900,000
- PWE cost (R50/member/month): R6,000,000
- **Net savings: -R2,100,000** (Year 1 - investment phase)

**Year 2+ (60% Reduction as Model Improves):**
- Hospitalizations prevented: 90
- Cost savings: R5,850,000
- PWE cost: R6,000,000
- **Net savings: -R150,000** (Break-even)

**Year 3+ (Churn Reduction Benefit):**
- Member retention improvement: 5% (500 members)
- Lifetime value per member: R120,000
- Retention value: R60,000,000
- **Total ROI: 900%+ over 3 years**

### 5.2 Clinical Outcomes Metrics

**Primary Outcomes:**
- [ ] 40-60% reduction in psychiatric hospitalizations
- [ ] 30% reduction in ER visits for mental health crises
- [ ] 25% improvement in medication adherence
- [ ] 50% reduction in symptom severity (PHQ-9/GAD-7 scores)

**Secondary Outcomes:**
- [ ] 80% user satisfaction (NPS >50)
- [ ] 70% engagement rate (active users per month)
- [ ] 5% member churn reduction
- [ ] 20% increase in Vitality points earned (wellness engagement)

### 5.3 Risk Mitigation Dashboard (Provider View)

**Key Metrics Displayed:**
1. **Population Health Score:** Average wellness score across all members
2. **Risk Distribution:** % of members in each risk category
3. **Intervention Effectiveness:** Which strategies work best
4. **Cost Avoidance:** Real-time calculation of hospitalizations prevented
5. **Predictive Accuracy:** Model performance over time

**Alerts & Actions:**
- **High-Risk Cohort Alert:** "250 members at elevated risk this week"
- **Recommended Action:** "Deploy targeted wellness campaign"
- **Expected Impact:** "Prevent 15 hospitalizations, save R975,000"

---

## 6. Regulatory & Ethical Considerations

### 6.1 Privacy & Data Protection
- **POPIA Compliance:** User consent, data minimization, right to deletion
- **HIPAA Compliance:** Encrypted storage, access controls, audit trails
- **GDPR Compliance:** Data portability, purpose limitation

### 6.2 Clinical Safety
- **FDA/SAHPRA Classification:** Software as Medical Device (SaMD) - Class II
- **Clinical Validation:** Prospective RCT with 1,000+ participants
- **Adverse Event Monitoring:** Track false negatives (missed crises)
- **Human Oversight:** Licensed clinicians review high-risk cases

### 6.3 Ethical AI
- **Bias Mitigation:** Test model across demographics (age, gender, race)
- **Explainability:** Users can see why they received an alert
- **Autonomy:** Users can opt out of any feature
- **Beneficence:** Interventions must improve outcomes, not just reduce costs

---

## 7. Success Criteria

### 7.1 Phase 1: Pilot (Months 1-6)
- [ ] 500 Discovery Health members enrolled
- [ ] 80%+ data collection success rate (wearables syncing)
- [ ] 70%+ user engagement (weekly active users)
- [ ] 10+ hospitalizations prevented (validated by case managers)

### 7.2 Phase 2: Scale (Months 7-12)
- [ ] 10,000 members enrolled
- [ ] 75%+ predictive accuracy (sensitivity + specificity)
- [ ] 50+ hospitalizations prevented
- [ ] R3M+ cost savings demonstrated

### 7.3 Phase 3: Market Leadership (Year 2+)
- [ ] 100,000+ members enrolled
- [ ] Category-defining feature (competitors copying)
- [ ] Published peer-reviewed study in JAMA or Lancet
- [ ] Expansion to other insurance providers (Momentum, Bonitas)

---

## 8. Competitive Differentiation

### 8.1 Why PWE Wins

| Feature | Competitors | PWE |
|---------|-------------|-----|
| **Prediction Lead Time** | 0 days (reactive) | 3-7 days (proactive) |
| **Data Streams** | 1-2 (self-report) | 5 (biometric + behavioral) |
| **Privacy** | Cloud-based | On-device processing |
| **Clinical Validation** | Minimal | RCT + peer-reviewed |
| **Insurance Integration** | None | Native Discovery Health API |
| **ROI Proof** | Anecdotal | Actuarial claims analysis |
| **Crisis Prevention** | Reactive hotline | Predictive intervention |

### 8.2 Moats (Defensibility)
1. **Data Network Effect:** More users = better predictions
2. **Clinical Partnerships:** Exclusive Discovery Health integration
3. **Regulatory Approval:** FDA/SAHPRA clearance (18-month barrier)
4. **IP Portfolio:** Patents on multi-stream prediction algorithms
5. **Brand Trust:** "The app that saved my life" testimonials

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] Integrate HealthKit/Google Fit APIs
- [ ] Build on-device keystroke analytics SDK
- [ ] Develop voice biomarker extraction pipeline
- [ ] Create risk prediction model (v1)
- [ ] Design user-facing alert system

### Phase 2: Pilot (Months 4-6)
- [ ] Recruit 500 Discovery Health members
- [ ] Deploy PWE to pilot cohort
- [ ] Collect 6 months of longitudinal data
- [ ] Validate predictive accuracy
- [ ] Iterate based on user feedback

### Phase 3: Scale (Months 7-12)
- [ ] Expand to 10,000 members
- [ ] Build provider dashboard
- [ ] Integrate with Discovery Health case management
- [ ] Publish clinical validation study
- [ ] Launch marketing campaign

### Phase 4: Market Dominance (Year 2+)
- [ ] 100,000+ members
- [ ] Expand to other insurers
- [ ] International markets (UK, Australia)
- [ ] B2B enterprise sales (corporate wellness)

---

## 10. Open Questions & Risks

### 10.1 Technical Risks
- **Wearable Adoption:** What if users don't have smartwatches? (Mitigation: Subsidize Oura Rings)
- **Battery Drain:** Can we keep it <5%? (Mitigation: Optimize ML models)
- **False Positives:** Alert fatigue? (Mitigation: Adaptive thresholds)

### 10.2 Clinical Risks
- **False Negatives:** Missing a crisis? (Mitigation: Human oversight + safety net)
- **Over-Reliance:** Users ignore symptoms because "app didn't alert"? (Mitigation: Education)

### 10.3 Business Risks
- **Regulatory Delays:** FDA/SAHPRA approval takes 2+ years? (Mitigation: Start as wellness tool, upgrade to SaMD)
- **Competitor Response:** Big Tech (Apple, Google) builds similar feature? (Mitigation: Speed + clinical validation)

---

## 11. Conclusion

The Predictive Wellness Engine is not just a feature—it's a **paradigm shift** in mental healthcare. By moving from reactive symptom management to proactive risk mitigation, PWE has the potential to:

1. **Save lives** through early intervention
2. **Save costs** by preventing hospitalizations
3. **Save relationships** by keeping members healthy and engaged

For Discovery Health, PWE is the **competitive moat** that differentiates them in a crowded market. It's the feature that makes members say: "I can't switch insurers—MindSync saved my life."

**This is the category-winning feature that transforms MindSync from a mental health app into a mental health guardian.**

---

**Next Steps:**
1. Review and approve requirements
2. Design technical architecture
3. Build MVP for pilot study
4. Validate with Discovery Health stakeholders
5. Launch and iterate

**Estimated Timeline:** 12 months to market leadership  
**Estimated Investment:** R15M (development) + R5M (clinical validation)  
**Expected ROI:** 900%+ over 3 years

---

*Document Version: 1.0*  
*Last Updated: January 22, 2026*  
*Author: Senior Health-Tech Product Strategist*