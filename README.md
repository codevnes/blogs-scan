# Hệ Thống Thu Thập Bài Viết CafeF và Tích Hợp ChatGPT

Ứng dụng Node.js thu thập bài viết từ CafeF (cụ thể là từ chuyên mục thị trường chứng khoán), xử lý qua ChatGPT và lưu trữ cả nội dung gốc và phân tích của AI trong cơ sở dữ liệu PostgreSQL.

## Tính Năng

- Thu thập tự động các bài viết từ chuyên mục thị trường chứng khoán CafeF (mặc định 30 phút một lần)
- Tùy chỉnh bộ chọn CSS để trích xuất bài viết
- Tích hợp với API ChatGPT của OpenAI
- Mẫu nhắc nhở (prompt) có thể tùy chỉnh
- Lưu trữ PostgreSQL với Sequelize ORM
- API RESTful cho các thao tác thủ công và truy xuất dữ liệu
- TypeScript giúp trải nghiệm phát triển tốt hơn

## Yêu Cầu Hệ Thống

- Node.js (v16+)
- Cơ sở dữ liệu PostgreSQL
- Khóa API OpenAI

## Cài Đặt

1. Clone repository và di chuyển đến thư mục dự án

```bash
git clone [đường-dẫn-repository]
cd blogs-scan
```

2. Cài đặt các gói phụ thuộc

```bash
pnpm install
```

3. Cấu hình môi trường

Tạo tệp `.env` trong thư mục gốc với các biến sau:

```
# Cấu Hình Máy Chủ
PORT=3000

# Cấu Hình Cơ Sở Dữ Liệu
DB_USERNAME=postgres
DB_PASSWORD=mật_khẩu_của_bạn
DB_DATABASE=blogs_scan
DB_HOST=localhost
DB_PORT=5432

# Cấu Hình OpenAI
OPENAI_API_KEY=khóa_api_openai_của_bạn

# Cấu Hình Thu Thập
SCRAPE_INTERVAL=30 # phút
TARGET_URL=https://cafef.vn/thi-truong-chung-khoan.chn

# Mẫu Nhắc Nhở ChatGPT
GPT_PROMPT_TEMPLATE="Phân tích bài viết sau từ CafeF: {{content}}"
```

4. Tạo cơ sở dữ liệu

```bash
createdb blogs_scan
```

5. Biên dịch và khởi động ứng dụng

```bash
# Biên dịch TypeScript
pnpm run build

# Khởi động máy chủ
pnpm start

# Chế độ phát triển với tự động khởi động lại
pnpm run dev
```

## Các Endpoint API

- `GET /api/articles` - Lấy tất cả bài viết
- `GET /api/articles/:id` - Lấy bài viết theo ID
- `POST /api/articles/scrape` - Kích hoạt thủ công việc thu thập bài viết
- `POST /api/articles/process` - Kích hoạt thủ công việc xử lý ChatGPT cho các bài viết chưa xử lý

## Tùy Chỉnh Nhắc Nhở

Bạn có thể tùy chỉnh nhắc nhở gửi đến ChatGPT bằng cách sửa đổi biến môi trường `GPT_PROMPT_TEMPLATE`. Placeholder `{{content}}` sẽ được thay thế bằng nội dung bài viết.

Ví dụ về mẫu nhắc nhở:

```
GPT_PROMPT_TEMPLATE="Phân tích bài viết tài chính này và cung cấp thông tin đầu tư: {{content}}"
```

```
GPT_PROMPT_TEMPLATE="Tóm tắt tin tức thị trường này trong 3 điểm chính: {{content}}"
```

## Tùy Chỉnh Thu Thập

Nếu cấu trúc trang web thay đổi, bạn có thể cần cập nhật bộ chọn CSS trong tệp `scraper.ts`:

- Bộ chọn danh sách bài viết trong hàm `scrapeArticlesList`
- Bộ chọn nội dung bài viết trong hàm `scrapeArticleContent`

## Giấy Phép

ISC 