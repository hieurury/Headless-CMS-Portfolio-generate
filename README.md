# Headless CMS Backend - Secure Serverless Architecture

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

A high-performance, secure, and scalable Headless CMS backend. Designed with a microservices mindset, deployed as a serverless container on Google Cloud Platform (GCP), and provisioned using Infrastructure-as-Code (SST).

## Tech Stack & Infrastructure
* **Compute:** Node.js, NestJS (Stateless Container on Google Cloud Run)
* **Database:** MongoDB Atlas (Stateful)
* **Infrastructure-as-Code (IaC):** SST (Pulumi/Terraform under the hood)
* **Cloud Security & Networking:** GCP IAM, Google Front End (GFE), Direct VPC Egress, Cloud NAT.
* **CI/CD:** GitHub Actions (Automated zero-downtime deployment)

---

## System Architecture & Design Patterns

The system is designed with a strict focus on security (Zero-Trust), network isolation, and high availability.

### 1. Security & Ingress Layer (Identity-Aware Proxy)
* **IAM-based Invocation:** The Cloud Run service is configured as a **Private Service**. It completely rejects unauthenticated public internet traffic.
* **Google Front End (GFE):** Acts as the gatekeeper. Clients must provide a valid OIDC Identity Token (`Authorization: Bearer <token>`). GFE verifies the token signature and IAM policies (`roles/run.invoker`) before routing the traffic. This prevents DDOS and unauthorized access at the platform edge (returning `401 Unauthorized` or `403 Forbidden`).

### 2. Compute Layer (Stateless Scaling)
* **Stateless Design:** The application is completely stateless, storing no local sessions. This allows Google Cloud Run to horizontally scale from 0 to N containers in milliseconds during traffic spikes.
* **Zero-Downtime Deployment:** CI/CD pipeline ensures new revisions are health-checked before traffic is smoothly migrated from the old containers.

### 3. Data & Egress Layer (Network Isolation)
To protect the database from public exposure, egress traffic is strictly routed through a custom Virtual Private Cloud (VPC):
* **Direct VPC Egress:** Cloud Run is connected to a custom subnet (`/24` to prevent IP Exhaustion during autoscaling).
* **Cloud NAT & Static IP:** All outbound traffic to MongoDB is forced through a Cloud NAT, which masks the dynamic container IPs with a single **Static External IP**.
* **IP Whitelisting:** The MongoDB Atlas firewall is locked down. The `0.0.0.0/0` rule is removed, and it only accepts connections originating exclusively from the GCP Cloud NAT Static IP.

### 4. Failure Patterns & Resiliency
* **Exponential Backoff:** The MongoDB connection utilizes `retryWrites=true` to automatically retry dropped packets or temporary network glitches without failing the user request.
* **Circuit Breaker:** Prevents cascading failures by short-circuiting database requests if the stateful storage becomes unresponsive, preserving compute resources and returning a fallback response.

---

## Local Development & Deployment

### Prerequisites
* Node.js v18+
* Google Cloud CLI (`gcloud`) authenticated with a project owner account.
* SST CLI

### 1. Local Setup
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Compile and run the project
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### 3. Run tests
```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

### 4. Infrastructure Deployment
When you are ready to deploy your backend to Google Cloud using SST:
```bash
npx sst deploy
```

## License
This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).