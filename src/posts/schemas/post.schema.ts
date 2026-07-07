import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

// Định nghĩa Enum cho trạng thái bài viết
export enum POST_STATUS {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
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
}

export const PostSchema = SchemaFactory.createForClass(Post);
