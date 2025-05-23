#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { extractArticlesFromHTML } from '../services/scraper';

/**
 * Công cụ dòng lệnh để trích xuất các liên kết từ HTML
 * 
 * Sử dụng:
 * - Đọc từ tệp: node dist/cli/extract-links.js --file=input.html --output=links.txt
 * - Đọc từ đầu vào chuẩn: cat input.html | node dist/cli/extract-links.js --output=links.txt
 */

async function main() {
  try {
    // Phân tích tham số dòng lệnh
    const args = process.argv.slice(2);
    const options: { [key: string]: string } = {};
    
    args.forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value;
      }
    });
    
    let htmlContent = '';
    
    // Đọc HTML từ tệp hoặc đầu vào chuẩn
    if (options.file) {
      const filePath = path.resolve(process.cwd(), options.file);
      htmlContent = fs.readFileSync(filePath, 'utf-8');
    } else {
      // Đọc từ stdin nếu không có tệp
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      htmlContent = Buffer.concat(chunks).toString('utf-8');
    }
    
    if (!htmlContent) {
      console.error('Không có dữ liệu HTML đầu vào. Vui lòng cung cấp tệp hoặc đầu vào chuẩn.');
      process.exit(1);
    }
    
    // Trích xuất các liên kết
    const links = extractArticlesFromHTML(htmlContent);
    const output = links.join('\n');
    
    // Ghi kết quả ra tệp hoặc đầu ra chuẩn
    if (options.output) {
      const outputPath = path.resolve(process.cwd(), options.output);
      fs.writeFileSync(outputPath, output);
      console.log(`Đã lưu ${links.length} liên kết vào ${outputPath}`);
    } else {
      console.log(output);
    }
    
    console.log(`Tổng số liên kết: ${links.length}`);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

main(); 