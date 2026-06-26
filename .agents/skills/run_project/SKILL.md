---
name: "Run Project Workflow"
description: "Được kích hoạt khi người dùng yêu cầu chạy dự án, start server, run app, hoặc các yêu cầu tương tự."
---

# Instructions

Khi người dùng yêu cầu chạy dự án (ví dụ: "chạy dự án", "start server", "run dev"), bạn PHẢI thực hiện theo đúng quy trình sau:

1. **Checkout nhánh main:** Chạy lệnh `git checkout main`.
2. **Pull code mới nhất:** Chạy lệnh `git pull` để cập nhật code mới nhất từ remote.
3. **Kiểm tra và tổng hợp commit:** Chạy lệnh `git log -n 5 --oneline` (hoặc tương tự) để lấy danh sách các commit gần đây nhất. Đọc lướt qua nội dung và tóm tắt ngắn gọn các thay đổi này cho người dùng biết.
4. **Chạy dev server:** Thực hiện lệnh chạy dev server phù hợp với dự án (ví dụ: `npm run dev`, `npm start`, hoặc `docker-compose up` tùy thuộc vào cấu hình của project).

Sau khi hoàn thành, hãy thông báo cho người dùng biết server đã sẵn sàng và cung cấp tóm tắt các commit mới nhất.
