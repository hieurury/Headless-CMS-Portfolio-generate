---
name: "Run Project Workflow"
description: "Được kích hoạt khi người dùng yêu cầu chạy dự án, start server, run app, hoặc các yêu cầu tương tự."
---

# Instructions

Khi người dùng yêu cầu chạy dự án (ví dụ: "chạy dự án", "start server", "run dev"), bạn PHẢI thực hiện theo đúng quy trình sau:

1. **Checkout nhánh main:** Chạy lệnh `git checkout main`.
2. **Pull code mới nhất:** Chạy lệnh `git pull` để cập nhật code mới nhất từ remote.
3. **Kiểm tra và tổng hợp commit:** Chạy lệnh `git log -n 5 --oneline` (hoặc tương tự) để lấy danh sách các commit gần đây nhất. Đọc lướt qua nội dung và tóm tắt ngắn gọn các thay đổi này cho người dùng biết.
4. **Chạy Backend server:** Ở thư mục gốc của dự án, chạy lệnh khởi động Backend (ví dụ: `npm run start:dev`).
5. **Chạy Frontend server:** Di chuyển vào thư mục `client` và chạy lệnh khởi động Frontend (ví dụ: `npm run dev`). **Lưu ý:** Phải chạy Backend và Frontend song song (ví dụ: mở 2 terminal hoặc chạy background tasks) riêng biệt.

Sau khi hoàn thành, hãy thông báo cho người dùng biết cả Backend và Frontend server đã sẵn sàng và cung cấp tóm tắt các commit mới nhất.
