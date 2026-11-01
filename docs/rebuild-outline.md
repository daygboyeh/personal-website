# Rebuild outline: five acts, one cluster

Who it's for: recruiters and hiring managers for platform engineering lead roles.
What they need within 30 seconds: who he is, what level he works at, the evidence, and how to reach him.

**Source tags:** `[CV]` = assets/Adebiyi_Adegboye_CV.pdf. `[SITE]` = copy already on the live site. `[CONFIRM]` = on the old site but not in the latest CV, so it's left out until confirmed. `[HIS WORDS]` = only Adebiyi can write it, so it stays hidden until filled.

---

## Act 1 · Hero (`#top`)
- **Name:** Adebiyi Adegboye `[SITE]` (the CV header says "Ade Adegboye"; the site keeps the full name)
- **Line:** I build cloud platforms, and the teams that run them. `[CV: "combining hands-on cloud architecture with people leadership"]`
- **Meta:** Platform Engineering Team Lead · London · 8+ years in cloud, DevOps and Kubernetes `[CV]`
- **Stack line:** AWS · Azure · OpenShift · Kubernetes `[CV]`
- **Actions:** Get in touch · Download CV
- **Scene (Stage B):** the namespace city, where you can break a pod

## Act 2 · Proof (`#proof`): five beats
1. **One container.** Every platform starts with one service that has to run in production. `[SITE framing]`
2. **Packaged once.** Helm and automated deployments, with repeatable GitOps patterns using Terraform/Terragrunt, Argo CD, Jenkins and GitHub Actions. `[CV]`
3. **43 services, 10 environments, one weekend.** 19 core services + 24 microservices, a weekend cutover, no issues on day one. `[CV]`
4. **Built to recover.** HA/DR, monitoring and capacity designed and reviewed for regulated enterprise environments. `[CV]`
5. **~13× throughput.** A data loader went from about 1,000 records per 65 s to 1,000 per 5 s. `[CV]`

Left out pending confirmation: −30% deployment time, −75% manual configuration, −20% cloud costs, −20% downtime `[CONFIRM]`.

## Act 3 · Work (`#work`): two case studies
### A. On-premises to cloud, in one weekend `[CV]`
- **Context:** an enterprise customer on a mission-critical financial-services platform moving from on-premises to cloud.
- **Scope:** 19 core services and 24 microservices across 10 environments.
- **Decisions:** phased, not big-bang; every service packaged with Helm; automated deployments, so all ten environments are built the same way; working with customer engineering and programme stakeholders on sizing, security and go-live readiness.
- **Outcome:** weekend cutover, no issues on day one.
- **What I'd do differently:** `[HIS WORDS]`

### B. The data loader that got 13× faster `[CV]`
- **Context:** a high-volume data-loader workload on a financial-data platform.
- **Diagnosis:** throughput was about 1,000 records per 65 seconds. Measuring before changing anything showed that audit/lineage overhead was the bottleneck.
- **Decision:** tune the workload configuration rather than rewrite the service.
- **Outcome:** about 1,000 records per 5 seconds, roughly 13× the throughput.
- **What I'd do differently:** `[HIS WORDS]`

### Also shipped
- End-to-end Azure platform delivery on AKS, including production JVM memory-retention diagnosis. `[SITE]`
- Private networking patterns with AWS PrivateLink, endpoint services and private DNS for cross-environment connectivity and cost. `[CV]`
- Backstage self-service provisioning, in progress, for delivery consistency and less manual build effort. `[CV]`
- AWS EKS, Azure AKS and ROSA/OpenShift environments spanning networking, identity, storage, secrets, monitoring and deployment lifecycle. `[CV]`

## Act 4 · Leadership (`#leadership`)
- **Opening (his words):** the "platform janitor" passage. "I come in quietly, clean things up, set up self-healing systems, and leave things better than I found them." `[SITE]`
- **How I lead** `[CV]`: work allocation, mentoring, architecture reviews and delivery planning, balanced against customer and commercial priorities; incident management; stakeholder engagement.
- **House rules** `[SITE]`: every tool is a trade-off · untested = broken · communication beats pure skill · small batches are non-negotiable.
- **Definition of done** as prose `[SITE]`: it works in production, it's observable, it's documented, others can operate it, it degrades gracefully, it can be changed safely, users can self-serve.
- **Quote** `[SITE]`: "DevOps isn't about tools. It's about discipline, empathy, and connecting people with systems that actually work."
- Team size ("two engineers") is on the old site but not in the CV, so the copy says "platform engineers" `[CONFIRM]`.

## Act 5 · Record and contact (`#record`, `#contact`)
- **Gresham Technologies** (formerly Alveo Technology; merged 2024): Platform Engineering Team Lead, Sep 2024 to present; Senior Cloud Engineer, Feb 2023 to Aug 2024 `[CV]`
- **Audeo:** DevOps Engineer, Nov 2020 to Jan 2023 `[CV]`
- **TSL Logistics:** Software Engineer, Feb 2019 to Oct 2020; Software Engineering Intern, Mar 2018 to Jan 2019 `[CV]`
- **Education:** MSc Advanced Computer Science, Leeds Beckett University; BSc Hydrology, University of Agriculture, Abeokuta `[CV + SITE]`
- **Certifications:** AWS Solutions Architect – Associate; AWS Developer – Associate; HashiCorp Terraform Associate `[CV]`
- **Now building:** Together Parenting, an app to keep family care connected `[SITE]`
- **Contact:** loluadegboye@gmail.com · LinkedIn · GitHub · CV (PDF) `[SITE]`
- **Scene (Stage B):** the "HI!" wall

## Cut
Signal Box / traffic router, the physics pod cluster, flip cards, the DoD checklist UI, self-service provisioner, service map, achievements, route rail, Together demo, boot intro, ticker.
**Kept:** the terminal (backtick key), the motion toggle, the skip link.
