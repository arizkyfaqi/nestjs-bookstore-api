import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UploadsService {
  async uploadCover(cover) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const filename = `${Date.now()}-${cover.originalname}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, cover.buffer);

    const thumbName = `thumb-${filename}`;
    const thumbPath = path.join(uploadDir, thumbName);
    await sharp(cover.buffer).resize(200, 300).toFile(thumbPath);

    return {
      coverUrl: `/uploads/${filename}`,
      thumbUrl: `/uploads/${thumbName}`,
    };
  }
}
