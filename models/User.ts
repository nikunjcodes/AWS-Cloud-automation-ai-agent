import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  awsCredentials: {
    accessKey: string | null;
    secretKey: string | null;
    region: string;
    amiArn?: string;
    keyPairName?: string;
    securityGroupId?: string;
  };
  awsRoleArn?: string;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Please provide a name']
  },
  awsCredentials: {
    accessKey: {
      type: String,
      default: null
    },
    secretKey: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: 'us-east-1'
    },
    amiArn: {
      type: String,
      default: null
    },
    keyPairName: {
      type: String,
      default: null
    },
    securityGroupId: {
      type: String,
      default: null
    }
  },
  awsRoleArn: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User; 