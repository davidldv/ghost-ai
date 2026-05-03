# Ghost AI

> A real-time collaborative workspace for designing software systems — because the hard part of engineering was never typing the code.

Ghost AI turns plain-English descriptions into living architecture diagrams. You describe a system, an AI agent maps it onto a shared canvas, your team refines it together in real time, and the final graph is converted into a Markdown technical specification.

---

## Why this exists

Modern code generation tools are extraordinarily good at producing implementations. What they cannot do — and what increasingly defines the value of a senior engineer — is decide *what should be built in the first place*.

The bottleneck of software has shifted upstream:

- **Implementation is becoming a commodity.** Once a system is well-specified, an AI can produce a working first pass of most modules in minutes. The marginal cost of code is collapsing.
- **Architecture is not.** Choosing the right boundaries between services, the right consistency model for a workload, the right failure domain, the right data ownership — these decisions compound across years and cannot be undone by a faster keyboard.
- **The expensive mistakes are structural.** A misplaced queue, a leaky abstraction, a coupling that should have been a contract — these are the bugs no autocomplete catches and no test suite exposes until production.

The job description of a senior engineer is quietly being rewritten. Less "writes the code." More "decides what code is worth writing, where it lives, and how its pieces talk." Ghost AI is built around that shift: it treats the diagram, not the file tree, as the primary artifact.

Once the system is designed well, the implementation largely writes itself. That is the point.

## What it does

- **Authenticated project workspaces.** Sign in, create a project, invite collaborators.
- **Real-time collaborative canvas.** Multiplayer nodes, edges, presence, and cursors powered by Liveblocks and React Flow.
- **AI architecture generation.** Describe a system in natural language; the agent populates the canvas with nodes and edges.
- **Starter templates.** A curated library of common patterns — microservices, event-driven, CI/CD, collaborative editor, and more — importable into any room.
- **Spec generation.** Convert the current graph into a persisted Markdown technical specification, ready to hand to an implementation agent or a human team.

## Tech stack

| Layer       | Choice                                              |
|-------------|-----------------------------------------------------|
| Framework   | Next.js 16, React 19                                |
| Auth        | NextAuth (Google, GitHub)                           |
| Database    | Postgres via Prisma                                 |
| Realtime    | Liveblocks (`@liveblocks/react-flow`)               |
| Canvas      | React Flow (`@xyflow/react`)                        |
| AI          | Vercel AI SDK + Google Gemini                       |
| Storage     | Vercel Blob for spec artifacts                      |
| Styling     | Tailwind CSS v4, shadcn/ui, Base UI primitives      |

## Getting started

```bash
# install
npm install

# configure environment
cp .env.example .env.local   # fill in DATABASE_URL, AUTH_*, LIVEBLOCKS_*, GOOGLE_GENERATIVE_AI_API_KEY, BLOB_READ_WRITE_TOKEN

# run migrations
npx prisma migrate dev

# start dev server
npm run dev
```

Open <http://localhost:3000>, sign in, and create your first project.

## Project structure

```text
app/                 Next.js routes (App Router)
  editor/            Workspace and per-project rooms
components/
  canvas/            React Flow nodes, edges, presence, controls
  editor/            Navbar, sidebar, dialogs, AI sidebar, templates
  ui/                shadcn / Base UI primitives
context/             Living architecture, scope, and standards docs
hooks/               Reusable client hooks (autosave, shortcuts, actions)
prisma/              Schema and migrations
types/               Domain types (canvas, presence, etc.)
```

## How to use it well

1. **Start with a prompt, not a file.** Tell the AI what the system should *do*, not how to build it. Let it propose the topology.
2. **Refine on the canvas.** Move nodes, rename services, change shapes (services, datastores, queues, gateways), and re-run generation against the new layout.
3. **Collaborate live.** Bring in the people who will own each piece — disagreements about boundaries are cheaper to settle on a diagram than in a pull request.
4. **Generate the spec.** When the graph reflects reality, export the Markdown spec. Hand it to your implementation pipeline (human, AI, or both).

## Status

Active development. See [`context/progress-tracker.md`](context/progress-tracker.md) for the current phase and open work.

## License

Private — not yet licensed for redistribution.
