# Partitura · Grandes compositores da música clássica

Aplicação web que apresenta os grandes compositores da música clássica e suas obras mais conhecidas. O usuário busca compositores, vê as obras populares de cada um e monta uma lista de **favoritos** com anotações pessoais, salva em um banco de dados real.

Projeto da disciplina, **Etapa 02: Persistência + Docker** (evolução direta da Etapa 01).

## Links

| Item | Link |
|---|---|
| Repositório no GitHub | https://github.com/JoaoVictorRosendo/Classicos-da-musica |
| Aplicação no GitHub Pages | https://joaovictorrosendo.github.io/Classicos-da-musica/ |
| Repositório no Docker Hub | https://hub.docker.com/r/joaorboas/bootcamp2-app |

## Comando para rodar (avaliador)

Com o Docker instalado, uma única linha sobe a aplicação:

```bash
docker run -d -p 8080:80 joaorboas/bootcamp2-app:1.1
```

Depois, abra http://localhost:8080 no navegador.

## Como a aplicação funciona

- **API externa:** [Open Opus](https://api.openopus.org), que fornece compositores (retrato, período de vida e época) e suas obras populares.
- **Frontend:** HTML, CSS e JavaScript puro (módulos ES), sem servidor próprio.
- **Banco de dados:** Supabase (PostgreSQL), acessado direto do navegador pela biblioteca `supabase-js`.
- **Servidor da imagem Docker:** Nginx (`nginx:alpine`).

Funcionalidades:

- Compositores em destaque ao abrir a página e busca por nome.
- Botão **Ver obras** com as obras populares de cada compositor.
- Botão **Favoritar** em compositores e obras.
- Seção **Meus favoritos**, que carrega ao abrir a página, com botões para **Anotar** (editar) e **Excluir**.

## Persistência de dados

**Banco escolhido:** Supabase (PostgreSQL), com projeto na região South America.

**Tabela `favoritos`:**

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint (identity, chave primária) | Identificador do registro |
| `criado_em` | timestamptz (padrão `now()`) | Data e hora em que foi favoritado |
| `tipo` | text (`compositor` ou `obra`) | Tipo do item favoritado |
| `nome_item` | text | Nome do compositor ou título da obra |
| `compositor` | text | Compositor da obra (vazio quando o item é um compositor) |
| `anotacao` | text | Anotação pessoal do usuário |
| `dados_extra` | jsonb | Informações adicionais (época do compositor, subtítulo da obra) |

**O que é salvo:** os compositores e as obras que o usuário favorita, com a anotação opcional. Os dados ficam no banco e sobrevivem ao fechamento do navegador.

**Operações implementadas:**

- **Create:** `insert` ao clicar em "Favoritar".
- **Read:** `select` ordenado por data, ao abrir a página.
- **Update (bônus):** `update` da anotação, no botão "Anotar".
- **Delete:** `delete` pelo `id`, no botão "Excluir".

O script de criação da tabela e das políticas está em [`schema.sql`](schema.sql).

**Limitação conhecida:** as políticas de acesso (RLS) da tabela estão abertas para o papel `anon`, como permitido nesta etapa. Isso significa que qualquer visitante lê e altera os favoritos de todos, porque ainda não há login de usuários. Em um produto real, seria necessário autenticação e políticas por usuário. A chave usada no frontend é a `anon public`, feita para esse uso.

## Executar localmente

1. Clone o repositório.
2. Em `script.js`, preencha `SUPABASE_URL` e `SUPABASE_KEY` com os dados do seu projeto Supabase.
3. Rode o `schema.sql` no SQL Editor do Supabase.
4. Sirva a pasta com um servidor local (por exemplo, a extensão Live Server do VS Code). Os módulos ES não funcionam abrindo o arquivo direto (`file://`).

## Testes

As funções puras estão em `utils.js` e testadas com Vitest:

```bash
npm install
npm test
```

## Docker

**Dockerfile:** usa `nginx:alpine` e copia `index.html`, `style.css`, `script.js` e `utils.js` para a pasta servida pelo Nginx.

Para construir e rodar localmente:

```bash
docker build -t bootcamp2-app .
docker run -d -p 8080:80 --name meu-app bootcamp2-app
```

Publicação no Docker Hub:

```bash
docker login
docker tag bootcamp2-app joaorboas/bootcamp2-app:1.0
docker push joaorboas/bootcamp2-app:1.0
```

## Sidequests

### SQ1 · .dockerignore

O arquivo [`.dockerignore`](.dockerignore) exclui da imagem o que não faz parte da aplicação servida: `.git`, `.github`, `node_modules`, `README.md`, `schema.sql`, arquivos `package*.json`, os testes (`*.test.js`), imagens de evidência (`*.png`), o próprio `Dockerfile` e o `.dockerignore`.

Isso deixa a imagem menor e o build mais rápido por dois motivos. Primeiro, o Docker envia a pasta do projeto inteira (o "contexto de build") para o motor antes de construir, e ignorar pastas pesadas como `.git` e `node_modules` reduz muito o volume enviado. Segundo, arquivos que não entram no contexto não podem invalidar o cache das camadas, então mexer no README ou nos testes não força o Docker a refazer passos desnecessários. Como o `Dockerfile` copia só quatro arquivos, o resultado final fica enxuto, e o `.dockerignore` protege contra que arquivos extras entrem por engano em um `COPY` futuro.

### SQ2 · Versionamento de imagem

Tags publicadas no Docker Hub:

- `1.0`: primeira versão funcional.
- `1.1`: melhoria que exibe as épocas musicais traduzidas para o português (Barroco, Romantismo etc.), com teste automatizado da função de tradução.
- `latest`: aponta para a versão mais recente (1.1).

```bash
docker build -t joaorboas/bootcamp2-app:1.1 .
docker tag joaorboas/bootcamp2-app:1.1 joaorboas/bootcamp2-app:latest
docker push joaorboas/bootcamp2-app:1.1
docker push joaorboas/bootcamp2-app:latest
```

O repositório https://hub.docker.com/r/joaorboas/bootcamp2-app mostra as três tags.

### SQ3 · Descrição no Docker Hub

O overview do repositório no Docker Hub contém: o que é a aplicação, o comando `docker run` pronto para copiar e o link do repositório no GitHub (https://github.com/JoaoVictorRosendo/Classicos-da-musica).

### SQ4 · Explorando a orquestração

Dois containers da mesma imagem rodando ao mesmo tempo, em portas diferentes (8080 e 8081):

```bash
docker run -d -p 8080:80 --name app1 joaorboas/bootcamp2-app:1.1
docker run -d -p 8081:80 --name app2 joaorboas/bootcamp2-app:1.1
docker ps
```

Evidência (`docker ps` com os dois containers):

![docker ps mostrando dois containers](docker-ps.png)

**E se eu tivesse 100 containers, como gerenciaria?** Subir e acompanhar cada container à mão, como fiz com dois, não escala: seria preciso escolher portas, reiniciar o que cair, distribuir a carga e atualizar versões sem tirar o serviço do ar. É para isso que existe o **Kubernetes**, um orquestrador de containers. Nele, um **cluster** é o conjunto de máquinas (nós) gerenciado em conjunto. O **pod** é a menor unidade que ele executa, e normalmente envolve um container da aplicação. Uma **réplica** é uma cópia idêntica de um pod: eu declaro quantas réplicas quero (por exemplo, 100) e o Kubernetes mantém esse número, recriando pods que falham, distribuindo-os entre os nós e balanceando o tráfego entre eles. Atualizações também são graduais (rolling update), trocando as réplicas da versão 1.0 pela 1.1 aos poucos. Assim, em vez de comandar containers um a um, eu descrevo o estado desejado e o cluster trabalha para mantê-lo.

## Autor

João Victor Rosendo, estudante de Engenharia de Software.
