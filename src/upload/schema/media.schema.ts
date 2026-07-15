import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum MEDIA_TYPE {
    IMAGE = 'image',
    VIDEO = 'video',
    DOCUMENTS = 'documents',
}

@Schema({
    timestamps: true,
})
export class Media {

    @Prop({ required: true })
    filename: string

    @Prop({ required: true })
    publicId: string

    @Prop({ required: true })
    url: string

    @Prop({ required: true })
    mimeType: string

    @Prop({ required: true, enum: MEDIA_TYPE })
    type: MEDIA_TYPE

    @Prop({ required: true })
    size: number

    @Prop()
    width?: number;

    @Prop()
    height?: number;

    @Prop()
    duration?: number;

    @Prop({
        default: false,
    })
    deleted: boolean


}

export type MediaDocument = Media & Document

export const MediaSchema = SchemaFactory.createForClass(Media);