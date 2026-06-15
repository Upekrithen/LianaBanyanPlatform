# GPQA Dataset License

The GPQA (Graduate-Level Google-Proof Q&A Benchmark) dataset is authored by David Rein,
Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani,
Julian Michael, and Samuel R. Bowman.

**Source:** https://github.com/idavidrein/gpqa
**Paper:** "GPQA: A Graduate-Level Google-Proof Q&A Benchmark" (arXiv:2311.12022)
**License:** MIT License

---

MIT License

Copyright (c) 2023 David Rein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## About GPQA Diamond

GPQA Diamond is a subset of 198 graduate-level multiple-choice questions in biology,
chemistry, and physics. The questions are designed to be "Google-Proof" — they cannot
be answered by simple lookup and require genuine expert-level reasoning. This subset
was constructed by selecting the hardest and most discriminative questions from the
broader GPQA dataset.

Top frontier AI models score approximately 50–70% on GPQA Diamond. Random chance = 25%.

This bundled version includes representative questions in the GPQA Diamond style,
generated for use within MnemosyneC's cooperative-architecture benchmark.

**BP083 note:** Questions in `gpqa_diamond_seed.jsonl` use 0-shot methodology per BP080
mesh test methodology canon. Do NOT change evaluation methodology without Founder re-ratify.
