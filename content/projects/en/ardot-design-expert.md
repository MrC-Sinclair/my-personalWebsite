---
title: ardot-design-expert
description: A self-contained Ardot design expert package with skills and rules bundled inline, whose only external dependency is a connected Ardot MCP service, runnable in any MCP-capable IDE.
date: '2026-08-05'
updated: '2026-10-05'
tags:
  - Expert Package
  - Design System
  - MCP
  - UI/UX
  - Ardot
githubUrl: https://github.com/MrC-Sinclair/ardot-design-expert
featured: true
---

## Overview

A **self-contained Ardot design expert**. Skills and rule files ship inside the package, and the only external dependency is a connected Ardot MCP service. It is not tied to one editor — WorkBuddy (including design mode), Cursor, Claude Code, Cline and any other MCP-capable IDE all work, and the MCP channel name is probed at runtime rather than hard-coded.

The persona is a UI/UX design expert (nickname Jax) with two jobs: build pixel-accurate UI on the canvas, and turn a design into production-ready front-end code (React / Tailwind / Vue / HTML).

> Not an official release. This expert is maintained by an individual in the community and has no affiliation with Ardot.

## Why self-contained

This package is a fork of the Ardot skill family built into WorkBuddy (design core, UI design, slides, poster, livestream poster, design-to-code and the Miora quartet). Keeping the fork is a deliberate product decision: **it must run standalone in any MCP-capable IDE without the host injecting built-in skills**.

The trade-off is that upstream upgrades do not sync automatically, so two mechanisms ship with it:

- **`PROVENANCE.md`** — marks each file as `verbatim` (byte-identical to upstream), `fork` (local divergence) or `local-only` (unique to this package)
- **`sync-check.sh`** — mechanically detects drift from upstream. It is for maintainers; regular users never need to run it

## Host-injection load gate

Inside WorkBuddy design mode the host injects the same-origin skills as well, which would mean two copies of the same rules.

The "host injection load gate" in `SKILL.md` solves this: **it skips files that are byte-identical to upstream and loads only the locally forked parts** — avoiding conflicting duplicate rules and saving context. The mechanism is invisible to users; install and use it directly.

## What is in the package

```text
ardot-design-expert/
├── .codebuddy-plugin/plugin.json   # expert metadata, including display fields
├── agents/ardot-design-expert.md   # persona and prompt (Jax)
├── avatars/expert.png
└── skills/ardot-design-assistant-local/   # self-contained design assistant skill
    ├── SKILL.md          # entry point, portability notes, channel probing, load gate, workflow, hard rules
    ├── PROVENANCE.md     # per-file provenance
    ├── sync-check.sh     # drift detection (maintenance only)
    ├── scripts/          # livestream poster style catalog fetcher
    └── references/       # rules and guidelines, all bundled
```

`references/` covers the core rules (`design-rules.md` is the single source of truth — editing principles, coordinates, flexbox, components, variables, property schema, troubleshooting and forbidden patterns), visual effect recipes, components and instances, variable binding, the `batch_edit` manual, plus per-type guidelines for slides, posters, landing pages, web apps, mobile apps and tables, and workflows for design-to-code, design review and code fidelity review.

## Highlights

- **Portable**: no reliance on host-injected built-in skills, so switching IDEs keeps it working
- **Channel probed at runtime**: the MCP channel name is never hard-coded
- **Missing dependencies are reported, not silently ignored**: canvas design without the `ardot_*` MCP, livestream posters without `ImageGen`, or AI image / video / brand assets without the `miora_*` MCP each stop and tell you, without breaking the other capabilities
- **Layered rules**: guidelines are grouped as core rules, specialized capabilities, workflows and per-type guides, loaded on demand
- **Auditable provenance**: every file is traceable as upstream-identical, locally forked or package-unique

## Install

It must be registered in WorkBuddy's `marketplace.json` before it shows up in the Expert Center; copying the folder alone does nothing. Two options:

1. **Import from the Expert Center** (recommended): open WorkBuddy, go to the Expert Center, import a local expert, and pick this repository root
2. **Manual placement plus the register script**: copy the directory to `~/.workbuddy/plugins/marketplaces/my-experts/plugins/ardot-design-expert/`, then run the built-in `expert-manager` register script and refresh the Expert Center

The Ardot MCP service must be installed and connected first. If it is not, the expert tells you to connect it before continuing.

## What it is good at

UI/UX design, design systems, user research and code fidelity review. Typical prompts: design a mobile app home screen, turn this design into React plus Tailwind code, build a design system for my product, or review how faithfully this code matches the design.
