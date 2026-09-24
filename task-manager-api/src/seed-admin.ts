import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await usersService.findByEmail(email);
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin user ${email} already exists. Nothing to do.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersService.create({
      email,
      password: hashedPassword,
      name,
      role: UserRole.ADMIN,
    });
    // eslint-disable-next-line no-console
    console.log(`Admin user created: ${email}`);
  }

  await app.close();
}

seed();
