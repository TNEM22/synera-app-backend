import mongoose, { Document, Query } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

interface User extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string | null;
  role: "user" | "admin";
  password: string;
  passwordConfirm: string | undefined;
  active: boolean;
  checkPassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: [true, "Must have a name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Must have an eamil."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Must have a password."],
      minLength: [8, "Password must have more than 8 characters."],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Must have a password."],
      minLength: [8, "Password must have more than 8 characters."],
      validate: {
        validator: function (e: string) {
          return e === this.password;
        },
        message: "Passwords are not the same!!",
      },
    },
    //   passwordChangedAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (this: Query<any, User>, next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (
  this: User,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
