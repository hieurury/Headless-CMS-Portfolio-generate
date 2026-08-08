/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "headless-cms-portfolio-generate",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const gcp = await import("@pulumi/gcp");
    const project = "n8nproject-461516";
    const imageTag = process.env.IMAGE_TAG || "latest";
    const myService = new gcp.cloudrunv2.Service("MyBackendService", {
      location: "asia-southeast1", // Region Singapore
      project: project,
      ingress: "INGRESS_TRAFFIC_ALL", // allow traffic all from internet
      template: {
        serviceAccount: "headless-cms-test@n8nproject-461516.iam.gserviceaccount.com",
        vpcAccess: {
          egress: "ALL_TRAFFIC",
          networkInterfaces: [{
            network: "headless-vpc",
            subnetwork: "headless-subnet-v2",
          }]
        },
        containers: [{
          image: `asia-southeast1-docker.pkg.dev/n8nproject-461516/my-repo/headless-cms-portfolio-generate:${imageTag}`,
          ports: { containerPort: 3000 },
          envs: [
            { name: "NODE_ENV", value: $app.stage },
            { name: "MONGODB_URI", value: process.env.MONGODB_URI },
            { name: "JWT_SECRET", value: process.env.JWT_SECRET },
            { name: "AI_TOKEN", value: process.env.AI_TOKEN },
            { name: "AI_MODEL", value: process.env.AI_MODEL },
            { name: "CLOUDINARY_CLOUD_NAME", value: process.env.CLOUDINARY_CLOUD_NAME },
            { name: "CLOUDINARY_API_KEY", value: process.env.CLOUDINARY_API_KEY },
            { name: "CLOUDINARY_API_SECRET", value: process.env.CLOUDINARY_API_SECRET },
            { name: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY },
            { name: "GEMINI_MODEL", value: process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-3.5-flash-lite" },
            { name: "SUB_GEMINI_MODEL", value: process.env.SUB_GEMINI_MODEL || "gemini-3.1-flash-lite" }
          ],
        }],
      },
    });

    new gcp.cloudrunv2.ServiceIamBinding("MyServicePublicAccess", {
      project: myService.project,
      location: myService.location,
      name: myService.name,
      role: "roles/run.invoker",
      members: ["allUsers"],
    });

    return {
      url: myService.uri,
    };
  },
});
