📝 Lista de Contatos

🔗 **Acesse o projeto online:** [https://lista-de-contatos-production.up.railway.app/](https://lista-de-contatos-production.up.railway.app/)

Este é um projeto de aplicação web para gerenciar contatos, permitindo adicionar, visualizar, editar, deletar, marcar como favoritos e pesquisar contatos. Desenvolvido com 
Next.js (App Router), React, Tailwind CSS e Prisma ORM para interação com um banco de dados SQLite.


✨ Funcionalidades

Adicionar Contato: Crie novos contatos com nome, e-mail, telefone, gênero, data de nascimento e foto de perfil.

Listar Contatos: Visualize todos os contatos em ordem alfabética.

Visualizar Detalhes: Veja informações completas de um contato específico.

Editar Contato: Atualize as informações de contatos existentes.

Deletar Contato: Remova contatos da lista.

Marcar como Favorito: Sinalize contatos importantes para fácil acesso.

Filtrar Favoritos: Exiba apenas os contatos marcados como favoritos.

Pesquisar Contatos: Encontre contatos rapidamente pelo nome.

Design Responsivo: Interface adaptada para desktop e mobile.


# 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar o projeto na sua máquina local.

Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:

Node.js (versão 18 ou superior)

npm (gerenciador de pacotes do Node.js) ou Yarn



# Passos para Instalação e Execução
Clone o Repositório:

git clone https://github.com/Joaovitorpires17/Lista-de-Contatos


# Instale as Dependências:

npm install
## ou
yarn install



# Configure o Banco de Dados (Prisma):

Para garantir que o Prisma Client esteja gerado e pronto para uso:

npx prisma generate



# Inicie o Servidor de Desenvolvimento:

npm run dev
## ou
yarn dev



O projeto estará acessível em http://localhost:3000.




## 🗄️ Visualizando o Banco de Dados SQLite
Se você quiser inspecionar o conteúdo do seu banco de dados SQLite (dev.db), você pode usar o Prisma Studio.

Execute o seguinte comando no terminal:

npx prisma studio

Isso abrirá uma interface web no seu navegador (geralmente em http://localhost:5555) onde você poderá visualizar e gerenciar os dados dos seus contatos.




## 🧪 Testando a API com Postman
Você pode testar os endpoints da API diretamente usando ferramentas como o Postman ou Insomnia. A base da sua API é http://localhost:3000/api/contacts.

GET /api/contacts: Lista todos os contatos.

GET /api/contacts?favorite=true: Lista apenas contatos favoritos.

GET /api/contacts?search=nome: Pesquisa contatos por nome.

POST /api/contacts: Cria um novo contato. (Requer JSON no corpo da requisição)

GET /api/contacts/:id: Obtém um contato específico.

PUT /api/contacts/:id: Atualiza um contato específico. (Requer JSON no corpo da requisição)

POST /api/contacts/:id/favorite: Alterna o status de favorito de um contato.

DELETE /api/contacts/:id: Deleta um contato específico.
