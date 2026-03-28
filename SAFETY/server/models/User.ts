import mongoose, { Document, Schema } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IEmergencyContact {
  name: string;
  phone: string;
}

export interface ISavedRoute {
  name?: string;
  source: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  timestamp?: Date;
}

export interface IUser extends Document {
  email: string;
  password?: string; // Optional because OAuth users might not have one
  name?: string;
  emergencyContacts: IEmergencyContact[];
  savedRoutes: ISavedRoute[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const UserSchema: Schema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: false },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true }
  }],
  savedRoutes: [{
    name: { type: String, required: false },
    source: { 
      lat: { type: Number, required: true }, 
      lng: { type: Number, required: true }, 
      name: { type: String, required: true } 
    },
    destination: { 
      lat: { type: Number, required: true }, 
      lng: { type: Number, required: true }, 
      name: { type: String, required: true } 
    },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true // Automatically manages createdAt and updatedAt properties
});

// 3. Create and Export the Model.
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
