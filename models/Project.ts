import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember {
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

export interface IProject extends Document {
  title: string;
  groupName: string;
  batchName: string;
  abstract: string;
  githubUrl: string;
  youtubeUrl?: string;
  members: IMember[];
  mentorName?: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, required: true, trim: true },
    isLead: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema: Schema<IProject> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    groupName: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    batchName: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [50, 'Batch name cannot exceed 50 characters'],
    },
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      maxlength: [5000, 'Abstract cannot exceed 5000 characters'],
    },
    githubUrl: {
      type: String,
      required: [true, 'GitHub URL is required'],
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Please provide a valid GitHub URL'],
    },
    youtubeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    members: {
      type: [MemberSchema],
      required: true,
      validate: {
        validator: (v: IMember[]) => v.length > 0,
        message: 'At least one member is required',
      },
    },
    mentorName: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
ProjectSchema.index({ title: 'text', abstract: 'text', groupName: 'text' });
ProjectSchema.index({ batchName: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ 'members.name': 1 });
ProjectSchema.index({ 'members.email': 1 });
ProjectSchema.index({ createdBy: 1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
