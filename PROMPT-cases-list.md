# Prompt pack: Cases List (/lecturer/courses/:courseId/cases)

How to use (Standard mode, one screen per generation):
1. In Stitch, create a project and import or paste DESIGN.md (same folder). If import is not available, paste the whole DESIGN.md at the top of PROMPT 1.
2. Paste PROMPT 1 and generate. Review the result. This is your anchor screen.
3. Run the edit prompts below ONE AT A TIME, each on the same screen (select it, then edit).
4. For every new screen later, paste DESIGN.md again and say "Match the visual style of the existing Cases List screen."

---

## PROMPT 1 (main screen)

```
# Stitch Prompt: Cases List (/lecturer/courses/:courseId/cases)

DESIGN SYSTEM
[paste DESIGN.md here if it is not imported]

## WHAT
Desktop web screen (1440px wide) listing the AI-generated and lecturer-authored cases of one university course. This is where the lecturer starts AI case generation.

## WHO
Lecturer. They own the course and review every case before students ever see it.

## WHY
Give the lecturer a clear overview of case status so they can review, approve and publish cases.

## WHEN
Follows the Course Catalog and the Materials screen. Leads to Case Review when a case is opened.

## DATA (use realistic sample content, not lorem ipsum)
Course: "Business Ethics". Sample cases:
- "Whistleblowing at a Mid-size Bank" | Branching Study | Draft | AI Draft marker | updated 2 hours ago
- "Supplier Audit Dilemma" | Branching Study | Reviewed | updated yesterday
- "Evaluating a Data-Sharing Policy" | Review Study | Approved | updated 3 days ago
- "Conflict of Interest in Procurement" | Branching Study | Published | updated last week
Each case card shows: title, learning-mode badge, status badge, a 1-2 line description in secondary text, and the last-updated time. The AI Draft marker appears only on cases in Draft status.

## ACTION
- "Generate Case": primary button, top-right of the page header. One primary button only.
- Filter tabs (underline style): All, Branching Study, Review Study. The active tab uses the underline in Action Blue.
- Clicking a case card opens that case for review.

## STATE
Show only the normal state with data in this screen. Other states come in later edits.

## VISUAL
- Breadcrumb above the title: Courses / Business Ethics / Cases.
- Page title "Cases" (28px semibold), tabs below the header, then a 2-column grid of case cards on the canvas background.
- Cards: white, 1px border, 12px radius, no shadow at rest.
- Calm, academic, restrained. Typography leads; color only on badges and the single primary button.

## BOUNDARY
- Light theme only. No dark mode.
- No gradients, glow, sparkle icons, emoji, or purple/indigo.
- No pill-shaped buttons (pills are for badges only).
- No scores, grades, rankings or pass/fail anywhere.
- Do not add navigation items, features or screens that are not listed here.
- Do not show a "Generate Case" button in any student view.
```

---

## EDIT PROMPTS (run one at a time on the same screen)

Edit 1, modal:
```
Add a "Generate Case" modal opened by the primary button, 560px wide, 16px radius. Fields: "Topic" (required textarea, helper text "10 to 500 characters"), "Source materials" (optional multi-select list, only fully processed documents), "Number of decision nodes" (optional number input). Footer: a secondary "Cancel" button and one primary "Generate" button. Keep every other element of the screen unchanged.
```

Edit 2, generating state:
```
Show the page while a case is being generated: the modal closed, a visible inline progress message "Generating your case..." in a banner above the grid (info color, neutral, no animation gimmicks), and the "Generate Case" button disabled. Keep the rest unchanged.
```

Edit 3, error state:
```
Show a failed generation: a toast in the top-right with a red left accent and the message "Case generation failed. Please try again or refine your topic." plus a "Try again" action. No technical error text. Keep the rest unchanged.
```

Edit 4, empty state (no cases):
```
Show the empty state of this screen: centered outline icon in gray, one sentence "No cases yet. Generate your first case from your course materials.", and the single primary button "Generate Case". Remove the grid. Keep the header and tabs.
```

Edit 5, no processed materials:
```
Show the case where the course has no processed materials yet: the "Generate Case" button disabled, and an inline hint below the header in secondary text: "Upload and process course materials before generating a case." with a text link "Go to Materials". Keep the rest unchanged.
```

Edit 6, loading:
```
Show the loading state: skeleton card placeholders in light gray (#F3F4F6) in the same 2-column grid, no spinner. Keep the header and tabs.
```

Edit 7, mobile check (optional):
```
Create a mobile version (390px wide) of this screen: single column of cards, 16px card padding, tabs scrollable horizontally, "Generate Case" button full width under the title.
```

---

## Checklist after each generation
- Only one blue primary button on the screen?
- No purple, gradient, emoji or sparkle icons?
- Status and mode badges use the exact color pairs from DESIGN.md?
- AI Draft marker is a neutral gray tag and appears only on Draft cases?
- No scores, grades or rankings?
If something is wrong, fix it with ONE short edit prompt instead of regenerating the whole screen.
