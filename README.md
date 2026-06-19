<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


# 🚀 Headless CMS Backend - Secure Serverless Architecture

A high-performance, secure, and scalable Headless CMS backend. Designed with a microservices mindset, deployed as a serverless container on Google Cloud Platform (GCP), and provisioned using Infrastructure-as-Code (SST).

## 🛠 Tech Stack & Infrastructure
* **Compute:** Node.js, Express.js (Stateless Container on Google Cloud Run)
* **Database:** MongoDB Atlas (Stateful)
* **Infrastructure-as-Code (IaC):** SST (Pulumi/Terraform under the hood)
* **Cloud Security & Networking:** GCP IAM, Google Front End (GFE), Direct VPC Egress, Cloud NAT.
* **CI/CD:** GitHub Actions (Automated zero-downtime deployment)

---

## 🏛 System Architecture & Design Patterns

The system is designed with a strict focus on security (Zero-Trust), network isolation, and high availability.

### 1. Security & Ingress Layer (Identity-Aware Proxy)
* **IAM-based Invocation:** The Cloud Run service is configured as a **Private Service**. It completely rejects unauthenticated public internet traffic.
* **Google Front End (GFE):** Acts as the gatekeeper. Clients must provide a valid OIDC Identity Token (`Authorization: Bearer <token>`). GFE verifies the token signature and IAM policies (`roles/run.invoker`) before routing the traffic. This prevents DDOS and unauthorized access at the platform edge (returning `401 Unauthorized` or `403 Forbidden`).

### 2. Compute Layer (Stateless Scaling)
* **Stateless Design:** The Express.js application is completely stateless, storing no local sessions. This allows Google Cloud Run to horizontally scale from 0 to N containers in milliseconds during traffic spikes.
* **Zero-Downtime Deployment:** CI/CD pipeline ensures new revisions are health-checked before traffic is smoothly migrated from the old containers.

### 3. Data & Egress Layer (Network Isolation)
To protect the database from public exposure, egress traffic is strictly routed through a custom Virtual Private Cloud (VPC):
* **Direct VPC Egress:** Cloud Run is connected to a custom subnet (`/24` to prevent IP Exhaustion during autoscaling).
* **Cloud NAT & Static IP:** All outbound traffic to MongoDB is forced through a Cloud NAT, which masks the dynamic container IPs with a single **Static External IP**.
* **IP Whitelisting:** The MongoDB Atlas firewall is locked down. The `0.0.0.0/0` rule is removed, and it only accepts connections originating exclusively from the GCP Cloud NAT Static IP.

### 4. Failure Patterns & Resiliency
* **Exponential Backoff:** The MongoDB connection utilizes `retryWrites=true` to automatically retry dropped packets or temporary network glitches without failing the user request.
* **Circuit Breaker (Planned):** Prevents cascading failures by short-circuiting database requests if the stateful storage becomes unresponsive, preserving compute resources and returning a fallback response.

---

## 💻 Local Development & Deployment

### Prerequisites
* Node.js v18+
* Google Cloud CLI (`gcloud`) authenticated with a project owner account.
* SST CLI

### 1. Local Setup
Clone the repository and install dependencies:
```bash
npm install