'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { PlusCircle, Star, Search as SearchIcon, Mail, Phone, Pencil, Trash } from 'lucide-react'; 

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  favorite: boolean;
  active: boolean;
  gender?: string | null;
  dateOfBirth?: string | null;
  profilePictureUrl?: string | null;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  async function fetchContacts() {
    try {
      const url = new URL('/api/contacts', window.location.origin);
      url.searchParams.append('active', 'true');

      if (showFavoritesOnly) {
        url.searchParams.append('favorite', 'true');
      }
      if (searchTerm.trim() !== '') {
        url.searchParams.append('search', searchTerm.trim());
      }

      console.log('Fetching contacts from URL:', url.toString());

      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro na resposta da API:", errorData);
        throw new Error(errorData.message || 'Falha ao carregar contatos');
      }
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Erro ao carregar contatos (frontend):", err);
      toast.error('Erro ao carregar contatos');
    }
  }

  async function toggleFavorite(id: number, current: boolean) {
    try {
      const res = await fetch(`/api/contacts/${id}/favorite`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Falha ao atualizar favorito');
      toast.success(current ? 'Removido dos favoritos' : 'Favoritado!');
      fetchContacts();
    } catch (err) {
      toast.error('Erro ao atualizar favorito');
    }
  }

  const handleCardClick = (id: number) => {
    router.push(`/contacts/${id}/view`);
  };

  async function handleDelete(id: number, name: string) {
  
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao deletar contato');
      toast.success(`Contato de ${name} deletado com sucesso!`);
      fetchContacts();
    } catch (err) {
      console.error("Erro ao deletar contato:", err);
      toast.error('Erro ao deletar contato');
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchContacts();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [showFavoritesOnly, searchTerm]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-4 sm:py-16 sm:px-6 flex flex-col items-center text-gray-100">
      <div className="max-w-5xl mx-auto w-full space-y-4 sm:space-y-12">

        <div className="flex sm:hidden justify-between items-center w-full mb-4">
          <h1 className="text-3xl font-extrabold text-white">Contatos</h1>
          <Link href="/add" passHref
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center
                       shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                       group"
          >
            <PlusCircle size={24} className="text-white group-hover:text-white transition-colors duration-300" />
          </Link>
        </div>

        <div className="hidden sm:flex justify-between items-center gap-6 mb-10 p-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full
                    sticky top-0 z-50 backdrop-blur-md">
          <h1 className="text-5xl font-extrabold text-white flex items-center gap-4">
            Lista de Contatos
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={(e) => {
                setShowFavoritesOnly(!showFavoritesOnly);
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              className={`font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 text-lg
                ${showFavoritesOnly ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-100'}`}
            >
              <Star size={20} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              {showFavoritesOnly ? 'Ver Todos' : 'Ver Favoritos'}
            </Button>

            <Link href="/add" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 text-lg">
                <PlusCircle size={32} /> Novo Contato
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex sm:hidden justify-start w-full mb-4">
          <Button
            onClick={(e) => {
              setShowFavoritesOnly(!showFavoritesOnly);
              (e.currentTarget as HTMLButtonElement).blur();
            }}
            variant="ghost"
            className={`font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out text-base
              ${showFavoritesOnly ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'}`}
          >
            <Star size={18} fill={showFavoritesOnly ? 'currentColor' : 'none'} className="mr-2"/>
            {showFavoritesOnly ? 'Ver Todos' : 'Ver Favoritos'}
          </Button>
        </div>


        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Pesquisar contatos por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-base"
          />
          <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {contacts.length === 0 ? (
          <p className="text-center text-gray-400 text-base sm:text-xl p-8 sm:p-12 bg-gray-800 rounded-2xl shadow-md border border-gray-700">
            {showFavoritesOnly ? 'Nenhum contato favoritado.' : 'Nenhum contato cadastrado. Comece adicionando um novo!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                className="relative bg-gray-800 shadow-xl rounded-2xl overflow-hidden
                           transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-2xl
                           border border-gray-700
                           min-h-[50px] sm:min-h-[260px] flex flex-col justify-between"
              >
                <div onClick={() => handleCardClick(contact.id)} className="flex-grow flex sm:hidden cursor-pointer">
                  <CardHeader className="p-2 flex flex-row justify-between items-center w-full">
                    <h2 className="text-lg font-bold text-white flex-grow min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">{contact.name}</h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(contact.id, contact.favorite);
                      }}
                      className={`p-1 rounded-full transition-all duration-200 ease-in-out ${contact.favorite ? 'text-yellow-400 bg-yellow-900/20 hover:bg-yellow-900/40' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'}`}
                      title={contact.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Star size={20} fill={contact.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </CardHeader>
                </div>

                <div onClick={() => handleCardClick(contact.id)} className="flex-grow hidden sm:flex flex-col cursor-pointer">
                  <CardHeader className="p-4 border-b border-gray-700 flex flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <img
                        src={contact.profilePictureUrl || "/default-profile.png"}
                        alt={`Foto de perfil de ${contact.name}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-profile.png";
                        }}
                      />
                      <h2 className="text-2xl font-bold text-white flex-grow min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">{contact.name}</h2>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(contact.id, contact.favorite);
                      }}
                      className={`p-2 rounded-full transition-all duration-200 ease-in-out ${contact.favorite ? 'text-yellow-400 bg-yellow-900/20 hover:bg-yellow-900/40' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'}`}
                      title={contact.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Star size={24} fill={contact.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </CardHeader>

                  <CardContent className="p-6 space-y-3 text-base text-gray-300 flex-grow flex flex-col justify-center">
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-400" /> 
                      <span className="font-semibold text-gray-200">E-mail:</span>{' '}
                      <span className="break-words">{contact.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={16} className="text-green-400" /> 
                      <span className="font-semibold text-gray-200">Telefone:</span>{' '}
                      {contact.phone}
                    </p>
                  </CardContent>
                </div>

                <CardFooter className="hidden sm:flex p-6 pt-4 border-t border-gray-700 justify-center gap-3">
                  <Link href={`/contacts/${contact.id}`} passHref>
                    <Button variant="outline" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 text-sm">
                      <Pencil size={18} /> Editar
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(contact.id, contact.name)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 text-sm">
                    <Trash size={18} /> Deletar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
