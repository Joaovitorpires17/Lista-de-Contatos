// app/api/contacts/[id]/route.ts
// Este arquivo gerencia as requisições para a rota dinâmica /api/contacts/{id}.
// Funções:
// - GET: Busca os detalhes de um contato específico pelo ID.
// - PUT: Atualiza todos os dados de um contato específico pelo ID.
// - DELETE: Deleta um contato específico pelo ID.


import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/lib/prisma';
import { Gender } from '@prisma/client';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de contato inválido.' }, { status: 400 });
    }

    const deletedContact = await prisma.contact.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(deletedContact, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar contato logicamente:", error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao deletar contato.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de contato inválido.' }, { status: 400 });
    }

    const contact = await prisma.contact.findUnique({
      where: { id, active: true },
    });

    if (!contact) {
      return NextResponse.json({ message: 'Contato não encontrado ou inativo.' }, { status: 404 });
    }

    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar contato:", error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao buscar contato.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID de contato inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, gender, dateOfBirth, profilePictureUrl } = body;

    const errors: { name?: string; email?: string; phone?: string; gender?: string; dateOfBirth?: string; profilePictureUrl?: string } = {};

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      errors.name = "Nome inválido ou vazio.";
    }

    if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      errors.email = "E-mail inválido.";
    }

    let validatedPhone: string | undefined = undefined;
    if (phone !== undefined) {
      const phoneValidationResult = validateAndFormatPhone(phone);
      if (phoneValidationResult.error) {
        errors.phone = phoneValidationResult.error;
      } else {
        validatedPhone = phoneValidationResult.formattedPhone;
      }
    }

    let validatedGender: Gender | null | undefined = undefined;
    if (gender !== undefined) {
      if (gender === null) {
        validatedGender = null;
      } else if (typeof gender === 'string') {
        const upperGender = gender.toUpperCase();
        if (['MASCULINO', 'FEMININO', 'NAO_BINARIO', 'OUTRO'].includes(upperGender)) {
          validatedGender = upperGender as Gender;
        } else {
          errors.gender = "Gênero inválido. Opções: Masculino, Feminino, Não Binário, Outro.";
        }
      } else {
        errors.gender = "Formato de Gênero inválido.";
      }
    }

    let parsedDateOfBirth: Date | null | undefined = undefined;
    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null) {
        parsedDateOfBirth = null;
      } else {
        try {
          parsedDateOfBirth = new Date(dateOfBirth);
          if (isNaN(parsedDateOfBirth.getTime())) {
            errors.dateOfBirth = "Data de Nascimento inválida.";
            parsedDateOfBirth = undefined;
          }
        } catch (e) {
          errors.dateOfBirth = "Formato de Data de Nascimento inválido.";
          parsedDateOfBirth = undefined;
        }
      }
    }

    let validatedProfilePictureUrl: string | null | undefined = undefined;
    if (profilePictureUrl !== undefined) {
      if (profilePictureUrl === null) {
        validatedProfilePictureUrl = null;
      } else if (typeof profilePictureUrl === 'string') {
        if (profilePictureUrl.trim() !== '') {
          validatedProfilePictureUrl = profilePictureUrl.trim();
        } else {
          validatedProfilePictureUrl = null;
        }
      } else {
        errors.profilePictureUrl = "URL da Foto de Perfil inválida.";
      }
    }


    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors: errors, message: "Verifique os dados do formulário para atualização." }, { status: 400 });
    }

    const dataToUpdate: {
      name?: string;
      email?: string;
      phone?: string;
      gender?: Gender | null;
      dateOfBirth?: Date | null;
      profilePictureUrl?: string | null;
    } = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (validatedPhone !== undefined) dataToUpdate.phone = validatedPhone;
    if (validatedGender !== undefined) dataToUpdate.gender = validatedGender;
    if (parsedDateOfBirth !== undefined) dataToUpdate.dateOfBirth = parsedDateOfBirth;
    if (validatedProfilePictureUrl !== undefined) dataToUpdate.profilePictureUrl = validatedProfilePictureUrl;


    const updatedContact = await prisma.contact.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar contato:", error);
    return NextResponse.json(
      { message: 'Ocorreu um erro interno do servidor ao tentar atualizar o contato.' },
      { status: 500 }
    );
  }
}

function validateAndFormatPhone(phoneInput: string): { formattedPhone?: string; error?: string } {
  if (!phoneInput) {
    return { error: "Telefone é obrigatório." };
  }

  const cleanPhone = String(phoneInput).replace(/\D/g, '');

  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { error: "Telefone inválido. Deve ter 10 ou 11 dígitos (incluindo DDD)." };
  }

  let formattedPhone: string;
  if (cleanPhone.length === 11) {
    formattedPhone = `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7, 11)}`;
  } else {
    formattedPhone = `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6, 10)}`;
  }

  return { formattedPhone };
}
