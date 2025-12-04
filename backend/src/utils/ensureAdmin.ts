import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';

export async function ensureAdminUser() {
  const adminEmail = 'admin@bepviet.com';
  const adminPassword = '123';

  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await UserModel.create({
    email: adminEmail,
    passwordHash,
    name: 'BepViet Admin',
    role: 'admin',
    status: 'active',
  });

  console.log('Created default admin user:', adminEmail, 'password:', adminPassword);

  return admin;
}


