# Migration System Guide

Hệ thống migration tracking giúp theo dõi và quản lý các file migration đã được thực thi.

## Cách hoạt động

1. **Bảng migrations**: Lưu trữ thông tin về các file migration đã được thực thi
2. **Kiểm tra trước khi chạy**: Script migrate sẽ kiểm tra bảng migrations để xác định file nào đã chạy
3. **Ghi lại sau khi thành công**: Mỗi migration thành công sẽ được ghi vào bảng migrations
4. **Xử lý xung đột**: Hệ thống tự động xử lý các xung đột giữa các migration

## Các script có sẵn

### 1. Setup bảng migrations
```bash
npm run migrate:setup
```
- Tạo bảng migrations trong database
- Chỉ cần chạy một lần duy nhất

### 2. Chạy migrations
```bash
npm run migrate
```
- Chạy tất cả migrations chưa được thực thi
- Tự động bỏ qua các file đã migrate
- Ghi lại kết quả vào bảng migrations
- Xử lý trường hợp bảng migrations chưa tồn tại

### 3. Kiểm tra trạng thái migrations
```bash
npm run migrate:status
```
- Hiển thị danh sách migrations đã chạy
- Hiển thị danh sách migrations đang chờ
- Thống kê tổng quan
- Xử lý trường hợp bảng migrations chưa tồn tại

### 4. Reset và migrate toàn bộ
```bash
npm run migrate:reset
```
- Xóa toàn bộ database và chạy lại từ đầu
- **CẢNH BÁO**: Sẽ mất toàn bộ dữ liệu
- Tự động ghi lại tất cả migrations đã chạy
- Xử lý xung đột giữa các migration files

### 5. Reset migrations
```bash
npm run migrate:reset
```
- Xóa toàn bộ database và chạy lại từ đầu
- **CẢNH BÁO**: Sẽ mất toàn bộ dữ liệu

## Cấu trúc bảng migrations

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | INTEGER | Khóa chính, tự động tăng |
| filename | STRING | Tên file migration |
| executed_at | DATE | Thời gian thực thi |
| created_at | DATE | Thời gian tạo record |
| updated_at | DATE | Thời gian cập nhật cuối |

## Quy trình sử dụng

1. **Lần đầu tiên**: Chạy `npm run migrate:setup` để tạo bảng migrations
2. **Chạy migrations**: Sử dụng `npm run migrate` để chạy các file mới
3. **Kiểm tra trạng thái**: Dùng `npm run migrate:status` để xem tình hình
4. **Thêm migration mới**: Tạo file trong thư mục `migrations/` và chạy lại migrate
5. **Reset hoàn toàn**: Sử dụng `npm run migrate:reset` khi cần làm mới database

## Xử lý xung đột

Hệ thống tự động xử lý các xung đột phổ biến:

- **Cột không tồn tại**: Migration sẽ bỏ qua việc xóa cột không tồn tại
- **Bảng không tồn tại**: Migration sẽ bỏ qua việc xóa bảng không tồn tại
- **Cột đã tồn tại**: Migration sẽ bỏ qua việc thêm cột đã tồn tại

## Lưu ý quan trọng

- **KHÔNG xóa file migration** đã chạy thành công
- **KHÔNG sửa đổi** file migration đã chạy
- Luôn backup database trước khi chạy migrations quan trọng
- Sử dụng `migrate:status` để kiểm tra trước khi chạy
- Khi có lỗi, kiểm tra log chi tiết để xác định nguyên nhân

## Troubleshooting

### Lỗi "migrations table not found"
- Chạy `npm run migrate:setup` trước

### Migration bị lỗi
- Kiểm tra log lỗi chi tiết
- Sửa lỗi trong file migration
- Chạy lại `npm run migrate`

### Muốn chạy lại migration đã chạy
- Xóa record tương ứng trong bảng migrations
- Chạy lại `npm run migrate`

### Lỗi xung đột cột/bảng
- Hệ thống tự động xử lý
- Kiểm tra log để xem chi tiết
- Đảm bảo thứ tự migration files đúng

### Reset database hoàn toàn
- Sử dụng `npm run migrate:reset`
- **CẢNH BÁO**: Mất toàn bộ dữ liệu
- Tự động ghi lại tất cả migrations 