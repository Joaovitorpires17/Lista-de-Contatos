// app/api/contacts/route.ts
// Este arquivo gerencia as requisições para a rota base /api/contacts.
// Funções:
// - GET: Lista todos os contatos (com filtros de favoritos e pesquisa).
// - POST: Cria um novo contato.

import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/lib/prisma';
import { Gender } from '@prisma/client';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, email, phone, gender, dateOfBirth, profilePictureUrl } = body;

    const errors: { name?: string; email?: string; phone?: string; gender?: string; dateOfBirth?: string; profilePictureUrl?: string } = {};

    if (!name || name.trim() === '') {
      errors.name = "Nome é obrigatório.";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "E-mail inválido.";
    }

    const phoneValidationResult = validateAndFormatPhone(phone);
    if (phoneValidationResult.error) {
      errors.phone = phoneValidationResult.error;
    } else {
      phone = phoneValidationResult.formattedPhone;
    }

    let validatedGender: Gender | null = null;
    if (gender !== undefined && gender !== null && typeof gender === 'string') {
      const upperGender = gender.toUpperCase();
      if (['MASCULINO', 'FEMININO', 'NAO_BINARIO', 'OUTRO'].includes(upperGender)) {
        validatedGender = upperGender as Gender;
      } else {
        errors.gender = "Gênero inválido. Opções: Masculino, Feminino, Não Binário, Outro.";
      }
    } else if (gender === null) {
      validatedGender = null;
    }

    let parsedDateOfBirth: Date | null = null;
    if (dateOfBirth) {
      try {
        parsedDateOfBirth = new Date(dateOfBirth);
        if (isNaN(parsedDateOfBirth.getTime())) {
          errors.dateOfBirth = "Data de Nascimento inválida.";
          parsedDateOfBirth = null;
        }
      } catch (e) {
        errors.dateOfBirth = "Formato de Data de Nascimento inválido.";
        parsedDateOfBirth = null;
      }
    } else if (dateOfBirth === null) {
      parsedDateOfBirth = null;
    }

    let validatedProfilePictureUrl: string | null = null;
    if (profilePictureUrl !== undefined && profilePictureUrl !== null && typeof profilePictureUrl === 'string') {
      if (profilePictureUrl.trim() !== '') {
        validatedProfilePictureUrl = profilePictureUrl.trim();
      }
    } else if (profilePictureUrl === null) {
      validatedProfilePictureUrl = null;
    }


    if (Object.keys(errors).length > 0) {
      const formattedErrors = Object.keys(errors).map(key => ({
        path: [key],
        message: errors[key as keyof typeof errors],
      }));
      return NextResponse.json({ errors: formattedErrors, message: "Verifique os dados do formulário." }, { status: 400 });
    }

    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        active: true,
        gender: validatedGender,
        dateOfBirth: parsedDateOfBirth,
        profilePictureUrl: validatedProfilePictureUrl,
      },
    });

    return NextResponse.json(newContact, { status: 201 });

  } catch (error) {
    console.error("Erro ao adicionar contato:", error);
    return NextResponse.json(
      { message: 'Ocorreu um erro interno do servidor ao tentar adicionar o contato.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showFavoritesOnly = searchParams.get('favorite') === 'true';
    const searchTerm = searchParams.get('search') || '';

    let contacts = await prisma.contact.findMany({
      where: { active: true },
    });

    if (showFavoritesOnly) {
      contacts = contacts.filter(contact => contact.favorite === true);
    }

    if (searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
      contacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    contacts.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao buscar contatos.' },
      { status: 500 }
    );
  }
}
