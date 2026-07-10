# ProofX

> **Where developers prove what they can build.**

ProofX is a developer-first professional platform designed around **proof of work, technical identity, collaboration, challenges, and real project contributions**.

Traditional professional platforms often depend heavily on resumes, self-reported skills, certificates, and endorsements. ProofX is being built around a different idea:

**A developer's work should speak louder than a list of claimed skills.**

ProofX combines professional networking, project repositories, technical challenges, collaboration, activity insights, and developer profiles into one unified ecosystem.

---

## Vision

The goal of ProofX is to build a platform where developers can:

* Build a professional technical identity
* Showcase real projects and repositories
* Demonstrate skills through proof of work
* Participate in technical challenges
* Collaborate with other developers
* Share technical posts and project updates
* Track development activity and progress
* Discover developers based on demonstrated ability
* Create organizations and development communities
* Communicate and collaborate inside the platform

ProofX is designed to evolve into a complete ecosystem connecting:

**Developers → Projects → Proof → Collaboration → Opportunities**

---

## Why ProofX?

The traditional hiring and professional networking process has several limitations.

A resume can claim:

* JavaScript
* React
* Next.js
* PostgreSQL
* System Design
* Backend Development
* Machine Learning

But a list of technologies does not always demonstrate how well someone can actually use them.

ProofX aims to provide a more complete technical identity through:

* Real repositories
* Project documentation
* Commit activity
* Technical challenges
* Proof submissions
* Collaboration history
* Development streaks
* Technical posts
* Community activity
* Project analytics

The long-term goal is simple:

> **Move developer evaluation from claimed skills toward demonstrated ability.**

---

## Core Platform Concept

ProofX brings together ideas commonly found across multiple categories of developer platforms.

### Professional Identity

Every user can build a detailed developer profile containing professional and technical information.

The platform is designed around a unified identity model rather than completely separating users into rigid account types.

A user may be:

* A developer
* A recruiter
* A client
* A project owner
* A contributor
* An organization member
* A technical reviewer

The same person can participate in different activities across the platform.

---

### Developer Home Feed

The ProofX home experience is designed as a professional developer activity feed.

The feed can contain:

* Technical posts
* Project announcements
* Repository updates
* Developer achievements
* Challenge activity
* Collaboration opportunities
* Community discussions
* Development insights

The home system includes components for:

* Activity feed
* Post cards
* Profile summary
* Navigation
* Insights
* Sidebars
* Demo content
* Search
* Notifications
* User menu
* AI assistant entry point

---

### Developer Profiles

Profiles are intended to become a developer's complete technical identity.

Profile capabilities include:

* Profile introduction
* Professional information
* Developer details
* Location information
* Profile avatar
* Banner media
* Contact information
* Technical activity
* Repository activity
* Proof history
* Streak information

The objective is to make a ProofX profile useful as both a professional identity and a technical portfolio.

---

### Repository Platform

Repositories are one of the central parts of ProofX.

The repository system is being designed to support features such as:

* Repository creation
* Project file management
* Repository profiles
* Code viewing and editing
* README rendering
* Markdown viewing
* Repository analytics
* Stars
* Watches
* Bookmarks
* Forking
* Collaboration
* Planning
* Search
* Permissions
* Storage management

The architecture also contains foundations for future source-control features including:

* Branches
* Commits
* Pull requests
* Issues
* Releases
* Discussions
* Wiki
* Packages
* Webhooks
* Project management

The goal is not simply to store project files.

The repository system is intended to become a structured source of technical evidence that contributes to a developer's ProofX identity.

---

### Proof of Work

Proof is a central concept of the platform.

A Proof can represent demonstrated technical work such as:

* A completed project
* A challenge solution
* A meaningful repository contribution
* A technical implementation
* A collaboration result
* A reviewed submission

The long-term vision is to connect technical claims with verifiable activity across the platform.

---

### Technical Challenges

ProofX includes a challenge system designed for skill demonstration and practical evaluation.

The challenge experience is intended to support:

* Challenge discovery
* Challenge participation
* Technical submissions
* Project-based evaluation
* Submission review
* Proof generation
* Skill demonstration

This can eventually support developers, teams, organizations, clients, and hiring workflows.

---

### Developer Streaks

ProofX includes an activity streak system designed to encourage consistent participation.

The streak system can track meaningful platform activity and display developer consistency.

The current architecture includes:

* Activity tracking API
* Streak service
* Streak utilities
* Streak display components
* Activity tracker components
* Database schema support

The long-term objective is to reward meaningful development activity rather than passive platform usage.

---

### Global Search

ProofX contains a search architecture intended to support discovery across the platform.

Search can evolve to cover:

* Developers
* Repositories
* Projects
* Organizations
* Posts
* Challenges
* Technical skills
* Locations

The platform includes a global search interface and dedicated search services.

---

### Dashboard

The ProofX dashboard provides access to the major areas of the platform.

Current dashboard routes and foundations include:

* Dashboard overview
* Analytics
* Challenges
* Messages
* Organizations
* Posts
* Profiles
* Proofs
* Repositories
* Settings

The dashboard architecture is designed to grow as additional ProofX modules become production-ready.

---

### Organizations

ProofX includes foundations for organization-based collaboration.

The organization system is intended to support future capabilities such as:

* Development teams
* Startup teams
* Open-source communities
* Company workspaces
* Organization repositories
* Team challenges
* Contributor management
* Organization activity

---

### Messaging and Collaboration

ProofX includes foundations for communication and technical collaboration.

Planned collaboration capabilities include:

* Direct messages
* Project discussions
* Repository collaboration
* Contributor workflows
* Review systems
* Notifications
* Team communication
* Technical interviews and live collaboration

---

## Platform Architecture

ProofX follows a modular feature-oriented architecture.

```text
ProofX/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── challenges/
│   │   │   ├── messages/
│   │   │   ├── organizations/
│   │   │   ├── post/
│   │   │   ├── profile/
│   │   │   ├── proofs/
│   │   │   ├── repositories/
│   │   │   └── settings/
│   │   │
│   │   └── home/
│   │
│   └── api/
│       ├── auth/
│       ├── locations/
│       ├── search/
│       └── streaks/
│
├── migrations/
│
├── public/
│
├── scripts/
│
└── src/
    ├── components/
    │   ├── dashboards/
    │   ├── home/
    │   ├── layouts/
    │   ├── navigation/
    │   ├── profile/
    │   ├── streaks/
    │   └── ui/
    │
    ├── constants/
    │
    ├── data/
    │
    ├── db/
    │   └── schema/
    │
    ├── demo/
    │
    ├── features/
    │   ├── actions/
    │   ├── analytics/
    │   ├── api/
    │   ├── branches/
    │   ├── collaboration/
    │   ├── commits/
    │   ├── discussions/
    │   ├── enterprise/
    │   ├── identity/
    │   ├── insights/
    │   ├── intelligence/
    │   ├── issues/
    │   ├── notifications/
    │   ├── organizations/
    │   ├── packages/
    │   ├── projects/
    │   ├── proof/
    │   ├── pull-requests/
    │   ├── releases/
    │   ├── repositories/
    │   ├── reviews/
    │   ├── search/
    │   ├── security/
    │   ├── source-control/
    │   ├── webhooks/
    │   └── wiki/
    │
    └── lib/
        ├── auth/
        ├── dashboard/
        ├── home/
        ├── locations/
        ├── profile/
        ├── search/
        ├── settings/
        ├── storage/
        └── streaks/
```

This structure is intended to keep the platform modular and easier to scale as ProofX grows.

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Lucide React
* Recharts

### Backend and Validation

* Next.js Server Architecture
* TypeScript
* Zod
* React Hook Form
* Zustand

### Database

* PostgreSQL
* Drizzle ORM
* Drizzle Kit

### Authentication and Platform Services

The application architecture includes authentication, sessions, profile management, repository services, search services, location services, and activity tracking.

---

## Database Architecture

ProofX contains database schema foundations for:

* Users
* Profiles
* Repositories
* Developer streaks

Database migrations are maintained inside the `migrations` directory.

The platform is being developed with a PostgreSQL-oriented architecture and Drizzle ORM for database access and schema management.

---

## Repository Module Architecture

The repository feature is separated into reusable components and service layers.

```text
src/features/repositories/
│
├── components/
│   ├── bookmark-button.tsx
│   ├── fork-button.tsx
│   ├── repository-analytics.tsx
│   ├── repository-card.tsx
│   ├── repository-code-editor.tsx
│   ├── repository-collaboration.tsx
│   ├── repository-list.tsx
│   ├── repository-markdown-viewer.tsx
│   ├── repository-planning-section.tsx
│   ├── repository-profile.tsx
│   ├── repository-readme.tsx
│   ├── repository-section-nav.tsx
│   ├── repository-upload-panel.tsx
│   ├── star-button.tsx
│   └── watch-button.tsx
│
├── repository-analytics.service.ts
├── repository-permissions.service.ts
├── repository-search.service.ts
├── repository-storage.service.ts
├── repository.schemas.ts
└── repository.service.ts
```

This separation allows the repository platform to evolve independently while remaining integrated with the larger ProofX ecosystem.

---

## Getting Started

### Prerequisites

Before running ProofX locally, install:

* Node.js
* npm
* Git
* PostgreSQL-compatible database access

### Clone the Repository

```bash
git clone <repository-clone-url>
```

Enter the project directory:

```bash
cd Proofx
```

Install dependencies:

```bash
npm install
```

Create your local environment configuration:

```text
.env.local
```

Add the required environment variables for your local database and authentication configuration.

Never commit environment secrets to source control.

Start the development server:

```bash
npm run dev
```

The development server will normally be available at:

```text
http://localhost:3000
```

If the port is already in use, the development server may select another available port.

---

## Development Workflow

Create a dedicated branch for new work:

```bash
git checkout -b feature/feature-name
```

After making changes:

```bash
git add .
git commit -m "feat: describe the feature"
git push -u origin feature/feature-name
```

Recommended commit prefixes:

```text
feat:     New feature
fix:      Bug fix
refactor: Code restructuring
docs:     Documentation update
style:    UI or formatting change
test:     Test-related change
chore:    Maintenance work
```

Example:

```bash
git commit -m "feat: add developer challenge submission workflow"
```

---

## Security Guidelines

Do not commit:

* `.env`
* `.env.local`
* Database passwords
* API secrets
* Access tokens
* Private keys
* Runtime user uploads
* Development logs
* Build directories
* Dependency directories

The repository `.gitignore` is configured to exclude local and generated resources that should not be stored in source control.

Runtime user content should be stored using an appropriate production storage architecture rather than directly committing uploaded files to the ProofX source repository.

---

## Development Status

ProofX is currently under active development.

The project contains implemented features, working foundations, experimental modules, demo interfaces, and architecture prepared for future platform capabilities.

Not every module represented in the architecture should be considered production-complete.

Current development areas include:

* Authentication
* Developer profiles
* Home feed experience
* Repository platform
* Proof system
* Challenges
* Organizations
* Messaging
* Search
* Notifications
* Analytics
* Developer streaks
* Collaboration systems

The architecture will continue evolving as the platform matures.

---

## Roadmap

Future development directions include:

* Advanced developer profiles
* Production-ready repository hosting
* Improved source-control workflows
* Challenge evaluation systems
* Proof verification
* Developer reputation models
* Advanced search and discovery
* Team collaboration
* Organization workspaces
* Messaging
* Notifications
* Pull request workflows
* Code review systems
* Issues and project boards
* Repository discussions
* Developer analytics
* Technical assessment workflows
* Collaboration sessions
* AI-assisted developer workflows
* Intelligent project discovery
* Contribution insights
* Opportunity matching

---

## Product Philosophy

ProofX is being built around several principles.

### Proof Over Claims

Technical ability should be supported by visible work and meaningful activity.

### Developers Own Their Identity

A developer profile should represent projects, contributions, progress, collaboration, and technical interests—not only a resume.

### Collaboration Creates Opportunity

Developers should be able to discover projects, contributors, challenges, teams, and opportunities through their work.

### Build in Public

Projects become more valuable when developers can document progress, share decisions, receive feedback, and collaborate.

### One Connected Developer Ecosystem

Profiles, repositories, challenges, proof, analytics, collaboration, and opportunities should work together rather than exist as disconnected tools.

---

## Long-Term Direction

The long-term direction of ProofX is to create an ecosystem where:

* Developers build a technical identity through real work
* Projects become evidence of skills
* Contributions become part of professional reputation
* Challenges provide practical skill demonstration
* Collaboration creates professional connections
* Organizations discover contributors through demonstrated ability
* Opportunities emerge from proof rather than only credentials

ProofX is not intended to be only a portfolio website, social network, or repository interface.

It is being designed as a **proof-of-work ecosystem for developers**.

---

## Contributing

ProofX is currently under active development.

Before contributing:

1. Review the existing architecture.
2. Create a dedicated feature branch.
3. Keep modules separated by responsibility.
4. Follow existing TypeScript patterns.
5. Avoid committing secrets or generated runtime files.
6. Test changes before opening a pull request.
7. Write clear and meaningful commit messages.

---

## Project Identity

**Product:** ProofX
**Organization:** Wild En Tree
**Category:** Developer Platform / Professional Network / Proof-of-Work Ecosystem
**Status:** Active Development

---

## Final Thought

> **Don't just say what you can build. Prove it.**

ProofX is being built for a future where developers are discovered, evaluated, and connected through what they actually create.

---

**ProofX — Build. Prove. Collaborate. Grow.**

