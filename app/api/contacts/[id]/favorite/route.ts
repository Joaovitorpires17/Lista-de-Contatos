// app/api/contacts/[id]/favorite/route.ts
// Este arquivo gerencia as requisições para a rota /api/contacts/{id}/favorite.
// Função:
// - POST: Alterna o status 'favorite' de um contato específico pelo ID.


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/lib/prisma';


export async function POST(

  request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contactId = Number(id);

  if (isNaN(contactId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { favorite: true },
  });

  if (!contact) {
    return NextResponse.json({ error: 'Contato não encontrado.' }, { status: 404 });
  }

  const updated = await prisma.contact.update({
    where: { id: contactId },
    data: { favorite: !contact.favorite },
  });

  return NextResponse.json(updated);
}
