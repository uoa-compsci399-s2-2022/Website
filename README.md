# Spatial Skills Testing Website

Created by Team 34 for COMPSCI 399.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Technologies used

- Server
  - [Next.js](https://nextjs.org/)
  - [NextAuth.js](https://next-auth.js.org/)
  - [Typescript](https://www.typescriptlang.org/)
  - [Prisma](https://www.prisma.io/)
  - [Apollo Server Micro](https://www.npmjs.com/package/apollo-server-micro)
  - [GraphQL](https://graphql.org/)
- Frontend
  - [React](https://reactjs.org/)
  - [TailwindCSS](https://tailwindcss.com/)
  - [HeadlessUI](https://headlessui.com/)
  - [fontawesome](https://fontawesome.com/)
  - [csv-parse](https://www.npmjs.com/package/csv-parse/)
  - [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser)
  - [formik](https://formik.org/)
  - [Apollo Client](https://www.apollographql.com/apollo-client)
- Hosting
  - [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)
  - [AWS RDS Database](https://aws.amazon.com/rds/) (Postgres)
  - [AWS S3](https://aws.amazon.com/s3)

## Getting Started

First, download the repo and install all the required packages:

```bash
git clone https://github.com/uoa-compsci399-s2-2022/Website
cd Website
npm install
```

Next, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the website.

## Environment Variables

| Name                 | Description                |
| -------------------- | -------------------------- |
| NEXTAUTH_URL         | Base URL for the website   |
| NEXTAUTH_SECRET      | Secret for generating keys |
| DATABASE_URL         | URL to postgres database   |
| GITHUB_ID            | GitHub OAuth ID            |
| GITHUB_SECRET        | GitHub OAuth Secret        |
| GOOGLE_CLIENT_ID     | Google OAuth ID            |
| GOOGLE_CLIENT_SECRET | Google OAuth Secret        |

For local development, you can include these variables in a `.env` file in the root directory.
Here is an example:

```
NEXTAUTH_URL=http://localhost:3000/
NEXTAUTH_SECRET=mydevelopmentkey
...
```