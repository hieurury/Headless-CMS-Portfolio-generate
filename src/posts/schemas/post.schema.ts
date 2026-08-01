import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

// Định nghĩa Enum cho trạng thái bài viết
export enum POST_STATUS {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    SCHEDULED = 'scheduled'
}

@Schema({ timestamps: true })
export class Post extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'posttype', required: true })
    postTypeId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    authorId: string;

    // Ảnh bìa đại diện của bài viết
    @Prop()
    coverImage: string;

    // LƯU NỘI DUNG (Content / Layout): Dùng kiểu Mixed để lưu cục JSON linh hoạt
    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    layout: any;

    // Chứa dữ liệu của các Custom Fields (được định nghĩa bên PostType)
    // Ví dụ: { price: 150000, color: 'red' }
    @Prop({ type: MongooseSchema.Types.Mixed })
    customFieldsData: any;

    // Gắn thẻ phân loại cho bài viết
    // Bạn có thể dùng String array hoặc tạo bảng Tags riêng và map ObjectId
    @Prop({ type: [String], default: [] })
    tags: string[];

    // Trạng thái bài viết
    @Prop({ required: true, enum: POST_STATUS, default: POST_STATUS.DRAFT })
    status: POST_STATUS;

    // Metadata cho SEO (Tùy chọn)
    @Prop({ type: MongooseSchema.Types.Mixed })
    seoMeta: {
        metaTitle: string;
        metaDescription: string;
    };

    // Trích dẫn ngắn hiển thị trên Card bài viết / RSS Feed
    @Prop({ maxlength: 500 })
    excerpt: string;

    // Thời gian xuất bản thực tế (dùng cho lên lịch bài viết)
    @Prop()
    publishedAt: Date;

    // Đánh dấu bài viết nổi bật (ghim lên đầu trang)
    @Prop({ default: false })
    isFeatured: boolean;

    // Số lượt xem
    @Prop({ default: 0 })
    viewCount: number;

    // Thời gian đọc ước tính (tính bằng phút)
    @Prop({ default: 0 })
    readingTime: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
