import { BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ImageUploadInterceptor = FileInterceptor('file', {
    storage: memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
    },

    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(
                new BadRequestException('Only image files are allowed'),
                false,
            );
        }

        cb(null, true);
    },
});