import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UploadsService {
  async processCover(file) {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // write original
    fs.writeFileSync(filepath, file.buffer);

    // create thumbnail
    const thumbName = `thumb-${filename}`;
    const thumbPath = path.join(uploadsDir, thumbName);
    await sharp(file.buffer).resize(200, 300).toFile(thumbPath);

    return {
      url: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/${thumbName}`,
    };
  }
}
