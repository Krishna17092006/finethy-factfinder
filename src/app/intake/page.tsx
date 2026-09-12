import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export default async function OpenIntakeRedirect() {
  // Create a new generic link and submission automatically
  const token = uuidv4();
  
  const link = await prisma.intakeLink.create({
    data: {
      token,
      clientName: 'Open Client',
      clientPhone: '0000000000',
    }
  });
  
  await prisma.submission.create({
    data: {
      linkId: link.id,
      status: 'draft',
    }
  });

  // Redirect to the unique token url so autosave works normally
  redirect(`/intake/${token}`);
}
