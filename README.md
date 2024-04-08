## Steps to intialize the backend

1.  Create new folder

    - mkdir medium

2.  Intialzie "hono" based cloudflare worker app

    - npm create hono@latest
      Target directory › backend
      Which template do you want to use? - cloudflare-workers
      Do you want to install project dependencies? … yes
      Which package manager do you want to use? › npm (or yarn or bun, doesnt matter)

3.  Intialize Db (prisma)

    - Get your connection url from neon.db or aieven.tech
    - Get connection pool URL from Prisma accelerate
    - Initialize prisma in your project

      - Make sure you are in the backend folder
      - npm i prisma
      - npx prisma init

    - Replace DATABASE_URL in .env
    - Add DATABASE_URL as the connection pool url in wrangler.toml
    - You should not have your prod URL committed either in .env or in wrangler.toml to github
    - wranger.toml should have a dev/local DB url
    - .env should be in .gitignore

4.  Initialize the schema

5.  Migrate your database

```
    npx prisma migrate dev --name init_schema
    npx prisma generate --no-engine
```

6.  Add the accelerate extension

```
    - npm install @prisma/extension-accelerate
```

7.  Initialize the prisma client

```
  import { PrismaClient } from '@prisma/client/edge'
  import { withAccelerate } from '@prisma/extension-accelerate'

  const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
  }).$extends(withAccelerate())

```

## Steps to deploy the backend

1. Login with cloudflare

   - for checkin is you login or not command

   ```
    npx wrangler whoami
   ```

   - for login

   ```
    npx wrangler login
   ```

2. Deploy your backend to cloudflare
   ```
    npm run dev => wrangler deploy --minify src/index.ts
   ```

```
npm install
npm run dev
```
