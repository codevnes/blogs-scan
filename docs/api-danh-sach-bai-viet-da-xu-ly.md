# API Lấy Danh Sách Bài Viết Đã Xử Lý

API này cho phép bạn lấy danh sách các bài viết đã được xử lý với phân trang.

## Thông tin chung

- **URL**: `http://103.162.21.193:4000/api/articles/processed`
- **Phương thức**: GET
- **Mô tả**: Trả về danh sách các bài viết đã được xử lý với thông tin phân trang

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|----------|----------|-------|
| page | số nguyên | không | 1 | Số trang hiện tại |
| pageSize | số nguyên | không | 20 | Số lượng bài viết trên mỗi trang |

## Cách sử dụng

### Ví dụ cơ bản

```javascript
// Lấy trang đầu tiên với kích thước trang mặc định (20 bài viết)
const response = await fetch('http://103.162.21.193:4000/api/articles/processed');
const data = await response.json();
```

### Ví dụ với tham số phân trang

```javascript
// Lấy trang thứ 2 với 10 bài viết mỗi trang
const response = await fetch('http://103.162.21.193:4000/api/articles/processed?page=2&pageSize=10');
const data = await response.json();
```

### Sử dụng với hàm API đã được định nghĩa

```javascript
import { getProcessedArticles } from './lib/api';

// Lấy trang đầu tiên với kích thước trang mặc định
const result = await getProcessedArticles();

// Lấy trang thứ 3 với 15 bài viết mỗi trang
const result = await getProcessedArticles({ page: 3, pageSize: 15 });
```

## Cấu trúc phản hồi

API trả về đối tượng JSON với cấu trúc sau:

```json
{
  "data": [
    {
      "id": 123,
      "title": "Tiêu đề bài viết",
      "url": "https://example.com/article",
      "content": "Nội dung bài viết",
      "publishedAt": "2023-08-15T10:30:00Z",
      "scrapedAt": "2023-08-15T11:00:00Z",
      "isProcessed": true,
      "createdAt": "2023-08-15T11:00:00Z", 
      "updatedAt": "2023-08-15T11:30:00Z",
      "processingAttempts": 1,
      "lastProcessingError": null,
      "lastProcessingAttempt": "2023-08-15T11:15:00Z",
      "ChatGPTResponses": [
        {
          "id": 456,
          "articleId": 123,
          "response": "Phản hồi từ ChatGPT",
          "promptUsed": "Prompt đã sử dụng",
          "processedAt": "2023-08-15T11:30:00Z",
          "createdAt": "2023-08-15T11:30:00Z",
          "updatedAt": "2023-08-15T11:30:00Z"
        }
      ]
    },
    // Các bài viết khác
  ],
  "pagination": {
    "totalCount": 100,
    "totalPages": 5,
    "currentPage": 1,
    "pageSize": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Mô tả cấu trúc dữ liệu

#### Bài viết (Article)

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | số nguyên | ID duy nhất của bài viết |
| title | chuỗi | Tiêu đề bài viết |
| url | chuỗi | URL nguồn của bài viết |
| content | chuỗi | Nội dung bài viết |
| publishedAt | chuỗi (ISO date) | Thời gian bài viết được xuất bản |
| scrapedAt | chuỗi (ISO date) | Thời gian bài viết được thu thập |
| isProcessed | boolean | Trạng thái xử lý của bài viết |
| createdAt | chuỗi (ISO date) | Thời gian tạo bản ghi |
| updatedAt | chuỗi (ISO date) | Thời gian cập nhật bản ghi |
| processingAttempts | số nguyên | Số lần thử xử lý bài viết |
| lastProcessingError | chuỗi | Lỗi xử lý gần nhất (nếu có) |
| lastProcessingAttempt | chuỗi (ISO date) | Thời gian thử xử lý gần nhất |
| ChatGPTResponses | mảng | Danh sách phản hồi từ ChatGPT |

#### Thông tin phân trang (Pagination)

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| totalCount | số nguyên | Tổng số bài viết |
| totalPages | số nguyên | Tổng số trang |
| currentPage | số nguyên | Trang hiện tại |
| pageSize | số nguyên | Số lượng bài viết trên mỗi trang |
| hasNextPage | boolean | Có trang tiếp theo hay không |
| hasPrevPage | boolean | Có trang trước hay không |

## Xử lý lỗi

Nếu có lỗi khi gọi API, phản hồi sẽ bao gồm mã trạng thái HTTP thích hợp và thông báo lỗi.