---
title: rawtherapee-photo-skills
description: An AI photo post-processing toolkit packaged as one installable skill, with three modules sharing a single config.toml and the RawTherapee CLI as the grading engine.
date: '2026-09-16'
updated: '2026-10-05'
tags:
  - Python
  - RawTherapee
  - Photo Editing
  - Batch Processing
  - RAW
githubUrl: https://github.com/MrC-Sinclair/rawtherapee-photo-skills
featured: true
---

## Overview

A whole photo post-processing pipeline packaged as a skill an AI can call end to end. RAW conversion, filtering by shooting date, batch color grading and browser-based before/after preview all share one root `config.toml`, with the **RawTherapee CLI** as the grading engine.

It is not a single script but three interlocking modules. Use one part on its own, or chain them into the full pipeline.

## Three modules

- **photo-toolkit** (`convert.py`, `find_by_date.py`, `layout_preview.py`, `deflicker.py`, `assemble.py`, `file_matcher.py`)
  Batch-converts RAW / JPG / HEIC into JPG thumbnails, finds and filters photos by shooting date, detects timelapse sequences, removes flicker between frames, assembles frames into MP4, and renders before/after or grid previews.

- **photo-grader** (`grade.py`)
  Lightroom-style batch grading driven by LLM-generated JSON parameters (exposure, contrast, HSL, tone curve and more). Exports graded JPG files or RawTherapee `.pp3` sidecars — the latter keeps the result non-destructive, so it can still be fine-tuned by hand inside RawTherapee.

- **photo-previewer** (`preview.py`)
  Serves an interactive browser preview of a graded session, with graded-versus-original grid toggle, per-style tabs and mobile gestures, on zero extra dependencies.

## Pipeline

```text
RAW / JPG / HEIC
    │
    ▼  photo-toolkit/scripts/convert.py        → JPG thumbnails
    ▼  [LLM generates grading_params.json]
    ▼  photo-grader/scripts/grade.py           → graded JPG / PP3 (RawTherapee)
    ├──▶ photo-toolkit/scripts/layout_preview.py  → static before/after or grid
    └──▶ photo-previewer/scripts/preview.py       → interactive browser preview
```

## Highlights

- **One config for all three modules**: a single root `config.toml`, so machine-local paths (on Windows external CLIs are usually not on `PATH`) are filled in once
- **Non-destructive grading**: `.pp3` sidecars leave the original RAW untouched and the parameters editable at any time
- **HEIC handled properly**: RawTherapee 5.13 cannot decode HEIC itself, so `pillow-heif` converts to TIFF first; 10/12-bit HEIC goes through `tifffile` to keep bit depth instead of falling back to 8-bit
- **RAW decoding always goes through rawpy**: `convert.py` uses rawpy for every RAW decode rather than as an optional path, avoiding color drift between format-specific branches
- **Dependencies only where needed**: the RawTherapee CLI is required by `grade.py` alone, FFmpeg by `assemble.py` alone; the rest run on the Python packages
- **Wide format coverage**: NEF, NRW, CR2, CR3, CRW, ARW, RAF, ORF, RW2, PEF, DNG and other mainstream camera RAW formats, plus JPEG and Apple HEIC / HEIF

## Engineering notes

1. The three modules split the work by "which one fits best" instead of reimplementing the same thing — conversion and filtering to the toolkit, grading to the grader, human confirmation to the previewer
2. Grading parameters are produced as JSON by the LLM, decoupling "describing the look you want" from "which sliders to move" — no one has to fill in a dozen fields by hand
3. The sidecar approach means an AI batch result stays editable in professional software; the AI output is a step in the workflow, not the end of it
4. Modules resolve shared scripts from sibling directories via `sys.path` (photo-grader reuses `file_matcher.py` from photo-toolkit), so the three folders must stay together

## Upstream and license

Merged and repackaged from [konanok/photo-skills](https://github.com/konanok/photo-skills), which all three modules come from under the MIT-0 license; this repackaging keeps the same terms. RawTherapee is a separate project, invoked here only as an external CLI.
