import mongoose, { Document } from 'mongoose';

interface IMessage {
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface IAWSConfig {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface IChat extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  awsConfig: IAWSConfig;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  messages: [MessageSchema],
  awsConfig: {
    region: {
      type: String,
      default: 'us-east-1'
    },
    credentials: {
      accessKeyId: {
        type: String
      },
      secretAccessKey: {
        type: String
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat; 