import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
@Schema({
    timestamps: true
})
export class Posttype extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop()
    description: string;

    @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
    customFieldsSchema: any;
}
