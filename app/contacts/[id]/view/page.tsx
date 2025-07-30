'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

import { ArrowLeft, User, Mail, Phone, Calendar, Image as ImageIcon, PersonStanding as GenderIcon, Star, Pencil } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  favorite: boolean;
  active: boolean;
  gender?: 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO' | null;
  dateOfBirth?: string | null;
  profilePictureUrl?: string | null;
  createdAt: string;
}

export default function ContactViewPage() {
  const router = useRouter();
  const { id } = useParams();
  const [contact, setContact] = useState<Contact | null>(null);

  const defaultProfilePicture = "/default-profile.png";

  async function fetchContactDetails() {
    if (!id) return;

    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (!res.ok) throw new Error('Contato não encontrado');

      const data: Contact = await res.json();
      setContact(data);
    } catch (err) {
      toast.error('Contato não encontrado ou erro ao carregar');
      router.push('/');
    }
  }

  async function toggleFavorite(contactId: number, current: boolean) {
    try {
      const res = await fetch(`/api/contacts/${contactId}/favorite`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Falha ao atualizar favorito');
      toast.success(current ? 'Removido dos favoritos' : 'Favoritado!');
      setContact(prevContact => {
        if (prevContact) {
          return { ...prevContact, favorite: !current };
        }
        return prevContact;
      });
    } catch (err) {
      toast.error('Erro ao atualizar favorito');
    }
  }

  useEffect(() => {
    fetchContactDetails();
  }, [id, router]);

  if (!contact) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 text-gray-100">
        <p className="p-6 sm:p-8 text-center text-gray-400 text-base sm:text-lg bg-gray-800 rounded-lg shadow-md border border-gray-700">
          Carregando detalhes do contato...
        </p>
      </main>
    );
  }

  const formattedDateOfBirth = contact.dateOfBirth
    ? new Date(contact.dateOfBirth).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Não informado';

  const formattedCreatedAt = new Date(contact.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:py-16 sm:px-6 flex flex-col items-center text-gray-100">
      <div className="max-w-md sm:max-w-xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2 sm:gap-4">
            <User size={28} className="text-blue-400" /> Detalhes do Contato
          </h1>
          <Link href="/" passHref>
            <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-1.5 px-4 sm:py-2 sm:px-5 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-sm">
              <ArrowLeft size={16} /> Voltar
            </Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-lg rounded-2xl border border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-700">
            <img
              src={contact.profilePictureUrl || defaultProfilePicture}
              alt={`Foto de perfil de ${contact.name}`}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultProfilePicture;
              }}
            />
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center break-words w-full px-2 sm:px-4">{contact.name}</h2>
            <button
              onClick={() => toggleFavorite(contact.id, contact.favorite)}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ease-in-out ${contact.favorite ? 'text-yellow-400 bg-yellow-900/20 hover:bg-yellow-900/40' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'}`}
              title={contact.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star size={28} fill={contact.favorite ? 'currentColor' : 'none'} />
            </button>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-300">
            <p className="flex items-center gap-2 sm:gap-3">
              <Mail size={18} className="text-blue-400" />
              <span className="font-semibold text-gray-200">E-mail:</span>{' '}
              <span className="break-words">{contact.email}</span>
            </p>
            <p className="flex items-center gap-2 sm:gap-3">
              <Phone size={18} className="text-green-400" />
              <span className="font-semibold text-gray-200">Telefone:</span>{' '}
              {contact.phone}
            </p>
            <p className="flex items-center gap-2 sm:gap-3">
              <GenderIcon size={18} className="text-pink-400" />
              <span className="font-semibold text-gray-200">Gênero:</span>{' '}
              {contact.gender ? contact.gender.charAt(0).toUpperCase() + contact.gender.slice(1).toLowerCase().replace(/_/g, ' ') : 'Não informado'}
            </p>
            <p className="flex items-center gap-2 sm:gap-3">
              <Calendar size={18} className="text-yellow-400" />
              <span className="font-semibold text-gray-200">Nascimento:</span>{' '}
              {formattedDateOfBirth}
            </p>
            <p className="flex items-center gap-2 sm:gap-3 text-sm text-gray-500">
              <Calendar size={14} />
              <span className="font-semibold">Criado em:</span>{' '}
              {formattedCreatedAt}
            </p>
          </CardContent>

          <CardFooter className="p-4 pt-3 sm:p-6 sm:pt-4 border-t border-gray-700 flex justify-end">
            <Link href={`/contacts/${contact.id}`} passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 sm:py-2 sm:px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-sm">
                <Pencil size={16} /> Editar Contato
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
