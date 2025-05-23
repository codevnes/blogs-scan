# Hướng Dẫn Sử Dụng Công Cụ Trích Xuất Bài Viết CafeF

Hướng dẫn này mô tả cách sử dụng công cụ dòng lệnh (CLI) để trích xuất và quét bài viết từ CafeF.

## Cài Đặt

Trước khi sử dụng các công cụ, hãy đảm bảo bạn đã cài đặt và biên dịch dự án:

```bash
# Cài đặt phụ thuộc
pnpm install

# Biên dịch TypeScript
pnpm build
```

## Trích Xuất Liên Kết Từ HTML

Công cụ này cho phép bạn trích xuất các liên kết bài viết từ HTML của trang CafeF.

### Sử Dụng với HTML từ tệp:

```bash
pnpm extract-links --file=html_input.html --output=links.txt
```

hoặc sử dụng phiên bản đã biên dịch:

```bash
pnpm extract-build --file=html_input.html --output=links.txt
```

### Sử Dụng với HTML từ đầu vào chuẩn (stdin):

```bash
cat html_input.html | pnpm extract-links --output=links.txt
```

### Tham số:

- `--file=<đường_dẫn>`: Đường dẫn đến tệp HTML đầu vào
- `--output=<đường_dẫn>`: Đường dẫn đến tệp đầu ra để lưu danh sách liên kết (không bắt buộc, mặc định là stdout)

## Quét Nội Dung Từ Danh Sách Liên Kết

Công cụ này quét nội dung của các bài viết từ danh sách liên kết và có thể lưu vào cơ sở dữ liệu hoặc tệp JSON.

### Cách Sử Dụng:

```bash
pnpm crawl-links --file=links.txt --output=articles --save-db --gpt
```

hoặc sử dụng phiên bản đã biên dịch:

```bash
pnpm crawl-build --file=links.txt --output=articles --save-db --gpt
```

### Tham số:

- `--file=<đường_dẫn>`: Đường dẫn đến tệp chứa danh sách liên kết (bắt buộc)
- `--output=<thư_mục>`: Thư mục để lưu các tệp JSON, mặc định là "crawled_articles"
- `--save-db`: Flag để lưu bài viết vào cơ sở dữ liệu
- `--gpt`: Flag để xử lý bài viết với ChatGPT (chỉ hoạt động khi --save-db được kích hoạt)

## Quy Trình Làm Việc Đầy Đủ

Một quy trình làm việc đầy đủ để quét bài viết từ CafeF:

1. Lưu HTML của trang danh mục vào tệp, ví dụ: `cafef_page.html`
2. Trích xuất liên kết bài viết từ HTML:
   ```bash
   pnpm extract-links --file=cafef_page.html --output=links.txt
   ```
3. Quét nội dung từ các liên kết và xử lý với ChatGPT:
   ```bash
   pnpm crawl-links --file=links.txt --save-db --gpt
   ```

## Quét Tự Động Theo Lịch

Để quét tự động theo lịch, bạn có thể sử dụng API có sẵn của dự án:

```bash
# Khởi động máy chủ API
pnpm start
```

API sẽ tự động quét trang CafeF theo khoảng thời gian được cấu hình trong tệp `.env` (mặc định là 30 phút).

Các API có sẵn:
- `GET /api/articles`: Lấy tất cả bài viết
- `POST /api/articles/scrape`: Kích hoạt quét thủ công
- `POST /api/articles/process`: Kích hoạt xử lý ChatGPT thủ công

## Ghi Chú

- Đảm bảo bạn đã cấu hình đúng `.env` với thông tin cơ sở dữ liệu và API key OpenAI
- Để tránh gây quá tải cho máy chủ CafeF, công cụ quét có thời gian chờ 1 giây giữa các yêu cầu
- Hãy tuân thủ các điều khoản sử dụng của CafeF khi quét dữ liệu 