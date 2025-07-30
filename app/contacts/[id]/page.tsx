'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Save, ArrowLeft, User, Mail, Phone, Calendar, Image as ImageIcon, PersonStanding as GenderIcon, Trash } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  favorite: boolean;
  gender?: 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO' | null;
  dateOfBirth?: string | null;
  profilePictureUrl?: string | null;
  active: boolean;
}

function validateAndFormatPhoneFrontend(phoneInput: string): { formattedPhone?: string; error?: string } {
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

export default function EditContactPage() {
  const router = useRouter();
  const { id } = useParams();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePictureBase64, setProfilePictureBase64] = useState<string | null>(null);
  const [profilePictureName, setProfilePictureName] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultProfilePicture = "/default-profile.png";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureBase64(reader.result as string);
        setProfilePictureName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePictureBase64(null);
      setProfilePictureName(null);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPhone(inputValue);
    const validationResult = validateAndFormatPhoneFrontend(inputValue);
    if (validationResult.error) {
      setPhoneError(validationResult.error);
    } else {
      setPhoneError(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEmail(inputValue);
    if (!inputValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      setEmailError("E-mail inválido.");
    } else {
      setEmailError(null);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePictureBase64(null);
    setProfilePictureName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    async function fetchContact() {
      if (!id) return;

      try {
        const res = await fetch(`/api/contacts/${id}`);
        if (!res.ok) throw new Error('Contato não encontrado');

        const data: Contact = await res.json();
        setContact(data);

        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setGender(data.gender || null);
        setDateOfBirth(data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '');
        setProfilePictureBase64(data.profilePictureUrl || null);

        if (data.profilePictureUrl) {
          setProfilePictureName("Foto existente");
        } else {
          setProfilePictureName(null);
        }

        const initialPhoneValidation = validateAndFormatPhoneFrontend(data.phone);
        if (initialPhoneValidation.error) {
          setPhoneError(initialPhoneValidation.error);
        } else {
          setPhoneError(null);
        }

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          setEmailError("E-mail inválido.");
        } else {
          setEmailError(null);
        }

      } catch (err) {
        toast.error('Contato não encontrado ou erro ao carregar');
        router.push('/');
      }
    }

    fetchContact();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact) return;

    const finalPhoneValidation = validateAndFormatPhoneFrontend(phone);
    if (finalPhoneValidation.error) {
      setPhoneError(finalPhoneValidation.error);
      toast.error("Por favor, corrija o número de telefone.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("E-mail inválido.");
      toast.error("Por favor, corrija o e-mail.");
      return;
    }

    setLoading(true);
    try {
      const contactData = {
        name,
        email,
        phone: finalPhoneValidation.formattedPhone,
        gender: gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        profilePictureUrl: profilePictureBase64,
      };

      console.log('Frontend PUT: Enviando dados do contato:', contactData);

      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || 'Erro ao atualizar contato';
        if (errorData.errors && errorData.errors.length > 0) {
          const phoneBackendError = errorData.errors.find((err: any) => err.path && err.path.includes('phone'));
          if (phoneBackendError) {
            setPhoneError(phoneBackendError.message);
          }
          const emailBackendError = errorData.errors.find((err: any) => err.path && err.path.includes('email'));
          if (emailBackendError) {
            setEmailError(emailBackendError.message);
          }
        }
        toast.error(errorMessage);
        console.error("Erro detalhado:", errorData);
        throw new Error(errorMessage);
      }

      toast.success('Contato atualizado com sucesso!');
      router.push('/');
    } catch (err) {
      console.error("Erro ao atualizar contato:", err);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!contact) return;

    if (!window.confirm(`Tem certeza que deseja deletar o contato de ${contact.name}?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Falha ao deletar contato');

      toast.success(`Contato de ${contact.name} deletado com sucesso!`);
      router.push('/');
    } catch (err) {
      console.error("Erro ao deletar contato:", err);
      toast.error('Erro ao deletar contato');
      setDeleting(false);
    }
  }

  if (!contact) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 text-gray-100">
        <p className="p-6 sm:p-8 text-center text-gray-400 text-base sm:text-lg bg-gray-800 rounded-lg shadow-md border border-gray-700">
          Carregando contato...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:py-16 sm:px-6 flex flex-col items-center text-gray-100">
      <div className="max-w-md sm:max-w-xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2 sm:gap-4">
            <span className="text-green-400">✏️</span> Editar Contato
          </h1>
          <Link href="/" passHref>
            <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-1.5 px-4 sm:py-2 sm:px-5 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-sm">
              <ArrowLeft size={16} /> Voltar
            </Button>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-lg rounded-2xl border border-gray-700 bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-300 flex items-center gap-2">
                <User size={14} className="text-blue-400" /> Nome
              </label>
              <Input
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-300 flex items-center gap-2">
                <Mail size={14} className="text-blue-400" /> E-mail
              </label>
              <Input
                id="email"
                type="text"
                name="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base
                  ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
              />
              {emailError && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-300 flex items-center gap-2">
                <Phone size={14} className="text-green-400" /> Telefone
              </label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                required
                className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base
                  ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
              />
              {phoneError && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-300 flex items-center gap-2">
                <GenderIcon size={14} className="text-pink-400" /> Gênero (Opcional)
              </label>
              <Select onValueChange={(value) => setGender(value === "null" ? null : value)} value={gender || "null"}>
                <SelectTrigger className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm sm:text-base">
                  <SelectValue placeholder="Selecione o Gênero" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border border-gray-600 text-sm sm:text-base">
                  <SelectItem value="null">Não Especificado</SelectItem>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="NAO_BINARIO">Não Binário</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-300 flex items-center gap-2">
                <Calendar size={14} className="text-yellow-400" /> Data de Nascimento (Opcional)
              </label>
              <Input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="profilePicture" className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-300 flex items-center gap-2">
                <ImageIcon size={14} className="text-purple-400" /> Foto de Perfil (Opcional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 text-sm sm:text-base flex-shrink-0"
                >
                  Escolher foto
                </Button>
                <span className="text-gray-400 text-sm sm:text-base truncate">
                  {profilePictureName || "Nenhuma foto selecionada"}
                </span>
              </div>
              {(profilePictureBase64 || contact?.profilePictureUrl) && (
                <div className="mt-3 sm:mt-4 flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={profilePictureBase64 || contact?.profilePictureUrl || defaultProfilePicture}
                    alt="Pré-visualização da foto de perfil"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemovePhoto}
                    className="text-red-400 hover:text-red-500 text-sm sm:text-base"
                  >
                    Remover Foto
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-3 sm:pt-4">
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 sm:py-2.5 sm:px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              >
                {deleting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span> Deletando...
                  </>
                ) : (
                  <>
                    <Trash size={16} /> Deletar Contato
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={loading || phoneError !== null || emailError !== null}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 sm:py-2.5 sm:px-6 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span> Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
