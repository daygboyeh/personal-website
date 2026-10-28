'use strict';
// Content follows the latest CV, using generic customer and product descriptions.
const projects = {
  azure: {title:'Azure platform architecture & delivery',category:'GRESHAM / AZURE & AKS',description:'I architected and delivered the complete enterprise platform on Microsoft Azure. The work translated a distributed microservices architecture into a production-ready AKS environment, covering cloud infrastructure, networking, identity, deployment automation, observability, and operational support. My ownership continued into production, including subsequent JVM memory-retention diagnosis and service mitigation.',tags:['Azure','AKS','Architecture','End-to-end delivery','Production operations']},
  distributed: {title:'Distributed financial-data platform',category:'GRESHAM / DISTRIBUTED SYSTEMS',description:'I lead architecture and delivery for a distributed financial-data platform comprising independently deployable microservices, Kafka, Cassandra, and relational services. The platform spans AWS, Azure, OpenShift, private-cloud, and on-premises estates. The work brings infrastructure, networking, storage, identity, security, and observability into consistent deployment patterns across managed-services and customer-hosted environments.',tags:['Kubernetes','Kafka','Cassandra','Multi-cloud','Platform strategy']},
  enterprise: {title:'Enterprise microservices delivery',category:'GRESHAM / CUSTOMER PLATFORM DELIVERY',description:'I shaped the delivery model for approximately 30 microservices in an enterprise banking environment. The scope included reusable Helm packaging, container-registry access, Kubernetes readiness, users and roles, Entra ID single sign-on, release governance, operational support boundaries, and handover. I also led platform architecture and delivery planning for public-sector financial institutions, addressing infrastructure dependencies, security constraints, and technical risk.',tags:['~30 microservices','Helm','Entra ID','Release governance','Customer delivery']},
  gitops: {title:'GitOps, repeatable deployments & cloud efficiency',category:'GRESHAM (FORMERLY ALVEO) / SENIOR CLOUD ENGINEER · 2023 — 2024',description:'As Senior Cloud Engineer at Alveo Technology, I optimised GitOps workflows and CI/CD pipelines to reduce deployment time by 30%. Reusable Helm charts reduced manual configuration work by 75%, while Kubecost-led optimisation reduced cloud costs by 20%. I also deployed Istio on EKS with automatic retries, improving application reliability and reducing downtime by 20%.',tags:['GitOps','EKS','Helm','Istio','Kubecost']}
};
const careerRoles = [
  {company:'TSL Logistics',role:'Software Engineer',dates:'MAR 2018 — OCT 2020',steps:[{role:'Software Engineering Intern',dates:'MAR 2018 — JAN 2019'},{role:'Software Engineer',dates:'FEB 2019 — OCT 2020'}],description:'Built applications and REST APIs using Java, JavaScript, MySQL, and MongoDB, working in a team of six engineers across ten bespoke client projects.',highlights:['Increased automated test coverage by 20% using JUnit and Mockito.','Used middleware, service-oriented architecture, and CI/CD to reduce release time by 30%.','Worked with product managers to turn requirements into well-scoped user stories.']},
  {company:'Audeo',role:'DevOps Engineer',dates:'NOV 2020 — JAN 2023',description:'Built delivery automation and reusable infrastructure for AWS, helping teams move from manual processes toward consistent, containerised deployments.',highlights:['Built Jenkins pipelines that removed approximately 70% of manual build and deployment work.','Developed reusable Terraform components and operated EC2, EKS, and Lambda.','Supported Kubernetes, blue-green and canary releases, Prometheus, and Grafana.']},
  {company:'Gresham',role:'Platform Engineering Team Lead',dates:'FEB 2023 — PRESENT',steps:[{role:'Senior Cloud Engineer',dates:'FEB 2023 — AUG 2024'},{role:'Platform Engineering Team Lead',dates:'SEP 2024 — PRESENT'}],description:'Joined in Feb 2023 as a Senior Cloud Engineer at Alveo Technology, which merged into Gresham in 2024, and stepped up to Team Lead in Sep 2024. Today I lead platform capability and enterprise delivery across managed-services and customer-hosted environments, spanning AWS, Azure, OpenShift, and Kubernetes.',highlights:['Lead two engineers, set priorities, mentor, and review designs.','Led a phased on-premises-to-cloud migration for an enterprise customer: 19 core services and 24 microservices across 10 environments, with a weekend cutover and no issues on day one.','Own architecture, delivery patterns, and complex production diagnosis.','As Senior Cloud Engineer: cut deployment time by 30% (GitOps, CI/CD), manual configuration by 75% (Helm), and cloud costs by 20% (Kubecost).']}
];
const careerTabs = [...document.querySelectorAll('[data-career]')];
function selectCareer(index, focus = false) {
  const item = careerRoles[index]; if (!item) return;
  document.querySelector('#career-date').textContent = item.dates;
  document.querySelector('#career-company').textContent = item.company.toUpperCase();
  document.querySelector('#career-role').textContent = item.role;
  const progress = document.querySelector('#career-progress');
  progress.replaceChildren(...(item.steps||[]).map((step,i,all)=>{const span=document.createElement('span');span.className=i===all.length-1?'now':'';span.textContent=`${step.role} · ${step.dates}`;return span;}));
  progress.hidden = !item.steps;
  document.querySelector('#career-description').textContent = item.description;
  document.querySelector('#career-highlights').replaceChildren(...item.highlights.map(text => {const li=document.createElement('li');li.textContent=text;return li;}));
  document.querySelector('#career-panel').setAttribute('aria-labelledby',`career-tab-${index}`);
  careerTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  if (focus) careerTabs[index].focus();
}
careerTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectCareer(index));
  tab.addEventListener('keydown',event=>{
    const offsets={ArrowLeft:-1,ArrowRight:1,Home:-index,End:careerRoles.length-1-index};
    if (!(event.key in offsets)) return;
    event.preventDefault();selectCareer((index+offsets[event.key]+careerTabs.length)%careerTabs.length,true);
  });
});
document.querySelector('#full-career').replaceChildren(...[...careerRoles].reverse().map(item=>{
  const article=document.createElement('article');
  const date=document.createElement('small');date.textContent=item.dates;
  const title=document.createElement('h3');title.textContent=item.steps?`${item.company} / ${item.steps.map(step=>step.role).join(' → ')}`:`${item.company} / ${item.role}`;
  const description=document.createElement('p');description.textContent=item.description;
  article.append(date,title,description);return article;
}));
