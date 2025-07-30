// app/api/contacts/[id]/favorite/route.ts
// Este arquivo gerencia as requisições para a rota /api/contacts/{id}/favorite.
// Função:
// - PATCH: Alterna o status 'favorite' de um contato específico pelo ID.


import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    let contactIdFromUrl = resolvedParams.id;

    if (!contactIdFromUrl) {
      return NextResponse.json({ message: 'ID do contato não fornecido na URL.' }, { status: 400 });
    }


    const contactId = Number(contactIdFromUrl);


    if (isNaN(contactId)) {
      return NextResponse.json({ message: 'ID do contato inválido (não é um número).' }, { status: 400 });
    }

    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { favorite: true }
    });

    if (!existingContact) {
      return NextResponse.json({ message: 'Contato não encontrado.' }, { status: 404 });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        favorite: !existingContact.favorite,
      },
    });

    return NextResponse.json(updatedContact, { status: 200 });

  } catch (error) {
    console.error("Erro ao favoritar/desfavoritar contato:", error);
    return NextResponse.json(
      { message: 'Ocorreu um erro interno do servidor ao tentar atualizar o status de favorito.' },
      { status: 500 }
    );
  }
}