<p align="center">
  <img alt="Ship or Die - AI-powered background agents for automated coding tasks" src="images/demo.gif" width="600">
</p>

<h1 align="center">Ship or Die</h1>

<p align="center">
    A free and open source experimental project that allows you to run Codex/Claude in cloud containers as background agents. These agents implement tasks and automatically submit pull requests as results.
</p>

<p align="center">
  <a href="#what-it-does"><strong>What it does</strong></a> ·
  <a href="#technologies-used"><strong>Technologies</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#deployment"><strong>Deploy</strong></a> ·
  <a href="#learn-more"><strong>Learn More</strong></a>
</p>
<br/>

## What it does

This project enables you to:
- Deploy coding agents in secure cloud containers
- Run AI-powered tasks in the background
- Automatically generate and submit pull requests

## Technologies Used

- **[E2B](https://e2b.dev/)** - AI workloads in cloud containers with secure sandboxed environments
- **Drizzle** - Type-safe ORM for database operations
- **OpenRouter** - AI gateway for accessing multiple language models
- **PostgreSQL** - Primary database for storing project data
- **Upstash** - Redis-based queues and cron job management
- **Next.js** - Full-stack React framework

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The easiest way to deploy is using the Vercel button below, or manually deploy to [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kubiks-inc/ship-or-die)

## Cursor CLI Support

Cursor CLI support can easily be added to enhance the development experience with AI-powered code assistance.

## Learn More

To learn more about the technologies used:

- [E2B Documentation](https://e2b.dev/) - AI sandboxes for enterprise-grade agents
- [Drizzle Documentation](https://orm.drizzle.team/) - TypeScript ORM
- [OpenRouter Documentation](https://openrouter.ai/) - AI gateway
- [Next.js Documentation](https://nextjs.org/docs) - React framework
