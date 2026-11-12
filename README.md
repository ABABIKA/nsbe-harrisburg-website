# NSBE Harrisburg Website Redesign

A website redesign project created for **HCDD 440 at Penn State Harrisburg** in collaboration with the **National Society of Black Engineers (NSBE) Harrisburg chapter**.

The project focuses on improving the chapter’s digital experience for both **public visitors** and **current members** through a redesigned public-facing website and a member dashboard.

## Project Overview

The redesigned NSBE Harrisburg website is intended to make chapter information easier to find, improve usability across devices, and provide members with a more centralized space for chapter-related resources.

The current design direction combines two experiences:

- **Public Website** — introduces NSBE Harrisburg, promotes the organization, highlights events, and provides information for prospective and current members.
- **Member Dashboard** — provides logged-in members with quick access to chapter information, events, announcements, opportunities, resources, membership information, and Torch Token progress.

The project began with separate landing page and dashboard concepts. Based on stakeholder feedback, both concepts were retained and combined because they serve different user needs.

## Current Features

### Public Website
- Homepage / landing page
- Chapter information
- Upcoming events
- Calls to action for joining NSBE
- Officer / leadership information
- Resources and opportunities
- Responsive navigation
- Social media and external chapter links

### Member Experience
- Member dashboard
- Upcoming events
- Announcements
- Torch Token progress
- Membership status
- Opportunities
- Resources
- Member profile

Additional functionality and pages may be added as development continues.

## Technology

This project is being developed using:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Git / GitHub**
- **Figma** for UI/UX design and prototyping

## Getting Started

### 1. Clone the Repository

```bash
git clone REPOSITORY-URL-HERE
```

### 2. Enter the Project Folder

```bash
cd nsbe-harrisburg-website
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local development site at:

```text
http://localhost:3000
```

## Project Structure

```text
app/
├── page.tsx
├── about/
├── events/
├── opportunities/
├── resources/
├── login/
└── dashboard/

components/
├── Navbar.tsx
├── Footer.tsx
├── DashboardSidebar.tsx
└── reusable UI components

public/
└── images/
```

The structure may change as development continues.

## Team

This project is being developed by a four-person HCDD 440 student team.

### Project Manager
Responsible for project coordination, development planning, GitHub integration, shared site structure, and maintaining consistency across the final product.

### UI/UX Design
Responsible for translating research and stakeholder feedback into interface designs and maintaining consistency with the Figma prototype.

### Front-End Development
Responsible for implementing pages, components, responsive layouts, and interactions using Next.js and React.

### Accessibility & Usability
Responsible for evaluating usability, responsiveness, semantic structure, keyboard accessibility, content clarity, and consistency with accessibility best practices.

Team members may contribute across multiple areas throughout development.

## Git Workflow

Development should be completed using feature branches rather than working directly on `main`.

Example branches:

```text
main
├── feature/homepage
├── feature/dashboard
├── feature/public-pages
└── feature/login-accessibility
```

### Create a Branch

```bash
git checkout -b feature/branch-name
```

### Save Changes

```bash
git add .
git commit -m "Describe your changes"
```

### Push the Branch

```bash
git push -u origin feature/branch-name
```

Once the work is ready, create a **Pull Request** on GitHub before merging it into `main`.

## Design Goals

The redesigned site aims to be:

- Easy to navigate
- Visually consistent
- Responsive across desktop and mobile devices
- Accessible using keyboard navigation and semantic HTML
- Clear for both prospective and current members
- Consistent with NSBE Harrisburg’s identity and chapter needs

## Project Status

**Currently in development.**

The team has completed initial research, design concepts, stakeholder feedback, and prototype development. Current work focuses on translating the approved design direction into a functional Next.js website.

---

Created for **HCDD 440 — Human-Centered Design & Development, Penn State Harrisburg**.
