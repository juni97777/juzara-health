import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z, ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export const runtime = 'nodejs';

const schema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter.'),
  identityNumber: z.string().trim().min(8, 'Nomor identitas minimal 8 karakter.'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Pilih jenis kelamin.' }),
  address: z.string().trim().min(5, 'Alamat minimal 5 karakter.'),
  phone: z.string().trim().min(8, 'Nomor telepon minimal 8 karakter.'),
  email: z.string().trim().email('Format email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
  confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter.'),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Konfirmasi password harus sama dengan password.',
  path: ['confirmPassword'],
});

export async function POST(req: Request) {
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Periksa kembali data pendaftaran.' }, { status: 400 });
  }

  const value = parsed.data;
  const birthDate = new Date(`${value.birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) {
    return NextResponse.json({ error: 'Tanggal lahir tidak valid.' }, { status: 400 });
  }
  const year = birthDate.getUTCFullYear();
  if (year < 1980 || year > 2026 || birthDate.getTime() > Date.now()) {
    return NextResponse.json({ error: 'Tanggal lahir harus berada pada rentang 1980–2026 dan bukan tanggal mendatang.' }, { status: 400 });
  }

  const email = value.email.toLowerCase();
  const identityNumber = value.identityNumber.replace(/\s+/g, '');

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: 'Email sudah digunakan. Silakan masuk atau gunakan email lain.' }, { status: 409 });

    const existingIdentity = await prisma.patientProfile.findUnique({ where: { identityNumber }, select: { id: true } });
    if (existingIdentity) return NextResponse.json({ error: 'Nomor identitas sudah terdaftar.' }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        fullName: value.fullName,
        email,
        phone: value.phone,
        passwordHash: await bcrypt.hash(value.password, 12),
        role: 'PATIENT',
        patient: {
          create: {
            identityNumber,
            birthDate,
            gender: value.gender,
            address: value.address,
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    try {
      await createSession(user);
    } catch (sessionError) {
      console.error('[register] Account created but session creation failed:', sessionError);
      return NextResponse.json({ ok: true, accountCreated: true, message: 'Akun berhasil dibuat. Silakan masuk menggunakan email dan password.' }, { status: 201 });
    }

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    console.error('[register] Registration failed:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(', ') : String(error.meta?.target || 'data');
        return NextResponse.json({ error: target.toLowerCase().includes('email') ? 'Email sudah digunakan.' : 'Nomor identitas atau data unik lainnya sudah terdaftar.' }, { status: 409 });
      }
      if (error.code === 'P2021' || error.code === 'P2022') {
        return NextResponse.json({ error: 'Tabel database JUZARA belum dibuat atau belum sesuai. Admin perlu menjalankan sinkronisasi Prisma pada database.' }, { status: 503 });
      }
    }

    if (error && typeof error === 'object' && 'name' in error && String(error.name).includes('PrismaClientInitializationError')) {
      return NextResponse.json({ error: 'Database belum dapat dihubungi. Periksa DATABASE_URL dan DATABASE_URL_POOLED di Vercel.' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Server gagal menyimpan pendaftaran. Periksa Deploy Logs Vercel untuk detail penyebabnya.' }, { status: 500 });
  }
}
