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

    // Đặt tên project của bạn vào đây (yêu cầu bắt buộc từ Pulumi)
    const project = "n8nproject-461516";
    const imageTag = process.env.IMAGE_TAG || "latest";
    const myService = new gcp.cloudrunv2.Service("MyBackendService", {
      location: "asia-southeast1", // Region Singapore
      project: project, // <--- Thêm dòng này
      ingress: "INGRESS_TRAFFIC_ALL", // Cho phép nhận traffic từ bên ngoài
      template: {
        containers: [{
          image: `asia-southeast1-docker.pkg.dev/n8nproject-461516/my-repo/headless-cms-portfolio-generate:${imageTag}`,
          ports: { containerPort: 3000 },
          envs: [
            { name: "NODE_ENV", value: $app.stage },
            { name: "MONGODB_URI", value: process.env.MONGODB_URI },
            { name: "JWT_SECRET", value: process.env.JWT_SECRET },
            { name: "AI_TOKEN", value: process.env.AI_TOKEN },
            { name: "AI_MODEL", value: process.env.AI_MODEL }
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

    // 3. Xuất URL ra màn hình Terminal sau khi chạy xong
    return {
      ServiceURL: myService,
    };
  },
});
