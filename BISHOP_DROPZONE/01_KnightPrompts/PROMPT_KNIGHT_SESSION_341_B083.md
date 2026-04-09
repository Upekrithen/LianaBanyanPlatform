# K341: SP-12 Deep Reader Integration — Section-by-Section Comprehension Pass
# Priority: HIGH — Founder's primary request

## Objective
Run SP-12 (librarian-mcp/stitchpunks/sp12_deep_reader.py) on each content section
and generate a human-readable summary of what is in every file.

## Background
SP-12 was written in B083 and does mechanical classification (innovation_candidate,
paper, pudding, letter, etc.) but does NOT comprehend the content. The Founder wants
every file actually READ and summarized.

## Process
For each section (skip 05_TECHNICAL_SPECS — mostly code):
1. Run: python sp12_deep_reader.py --section SECTION_NAME
2. For each innovation_candidate result, read the actual archive JSON
3. Write a 1-2 sentence summary of what the document contains
4. Flag any un-threshed innovations not in the #1-#2211 registry
5. Output to: data/deep_reader_section_SECTION_NAME.json

## Sections to process (in priority order):
1. uncategorized (4,102 files — highest chance of buried gold)
2. 02_WRITTEN (1,208 files — papers, articles, essays)
3. 01_BLUEPRINTS (1,534 files — architecture docs)
4. 08_JOURNALS (297 files — founder journals)
5. 07_REFERENCE_MATERIALS (129 files — references)
6. 06_CAMPAIGN_MATERIALS (634 files — campaigns)
7. 03_PATENT_BAGS (677 files — patent materials)
8. 04_PRESS_ARTICLES (401 files — press/media)
9. 09_CONTEXT_MANAGEMENT (288 files — context docs)

## Validation
- Every section has a summary JSON file
- Innovation candidates cross-referenced against known registry
- SEC flags documented per file
