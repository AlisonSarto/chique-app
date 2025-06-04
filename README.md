# Chique App

Sistema web para gestão de pedidos de drinks em múltiplas lojas, com funções para atendente, cozinheiro, separador e painel administrativo.

## Funcionalidades

- **Login por loja e função**: Atendente, Cozinheiro, Separador, Admin
- **Cadastro e busca de clientes**
- **Gestão de pedidos**: criação, acompanhamento, finalização
- **Programa de fidelidade por loja**
- **Administração de cardápio**: CRUD de bebidas por loja
- **Painéis separados para cada função**
- **Interface responsiva e moderna (Tailwind CSS + jQuery)**

## Estrutura do Projeto

```
.
├── api/                # Endpoints PHP (pedidos, drinks, clientes, login)
├── app/                # Frontend (HTML, JS) para cada função
│   ├── admin/
│   ├── atendente/
│   ├── cozinheiro/
│   └── separador/
├── db/                 # Scripts SQL para criação do banco
├── funcs/              # Funções utilitárias PHP (env, config, send)
├── index.html          # Tela inicial de seleção de loja/função
├── .env.example        # Exemplo de configuração de ambiente
└── .htaccess           # Regras de URL amigável
```

## Instalação

1. **Clone o repositório**
2. **Configure o banco de dados**
   - Crie um banco MySQL e execute o script create.sql
3. **Configure as variáveis de ambiente**
   - Copie .env.example para .env.local e preencha com os dados do banco
4. **Ajuste permissões do servidor**
   - Certifique-se que o Apache está com mod_rewrite habilitado
5. **Acesse via navegador**
   - Abra `http://localhost/` para iniciar

## Variáveis de Ambiente

Veja o arquivo .env.example:

```
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
```

## Telas e Perfis

- **Atendente**: Cria pedidos, busca/cadastra clientes, seleciona bebidas, finaliza pagamento
- **Cozinheiro**: Visualiza pedidos pendentes, marca drinks como prontos (swipe)
- **Separador**: Visualiza pedidos prontos, marca como entregues
- **Admin**: Gerencia cardápio de bebidas (CRUD)

## Scripts Importantes

- create.php: Criação de pedidos
- view.php: Listagem de bebidas
- view.php: Listagem de clientes
- script.js: Lógica do painel admin

## Tecnologias

- PHP (API)
- MySQL (Banco de dados)
- jQuery (Frontend)
- Tailwind CSS (Estilo)
- HTML5

## Observações

- Imagens de bebidas são armazenadas como base64 no banco.
- O sistema utiliza sessões PHP para controle de loja/função.
- URLs amigáveis via .htaccess.

---

Desenvolvido para facilitar a operação de múltiplas lojas de drinks com controle de pedidos e fidelidade da Chique Drinks para a feira e empreendedorismo.

---

Desenvolvido em **14 horas de trabalho** por Alison Sarto 👨‍💻