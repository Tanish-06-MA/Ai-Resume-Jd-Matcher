# Testing match quality

To check the configured Hugging Face and Groq credentials independently on a synthetic example, run `npm run test:providers`. This calls both providers and uses quota. A Hugging Face fallback is reported as a failure by this diagnostic. It does not perform a PDF upload, login, or database save.

## Check the real upload flow

1. Start MongoDB, then start the backend with `npm start` from `backend`.
2. Start the frontend with `npm run dev` from `frontend`, sign in, and upload an anonymized PDF with its job description.
3. On success, inspect the analysis response in the browser Network panel. `matchMethod: "semantic-embedding"` means both vectors came from Hugging Face; `matchMethod: "local-text-overlap"` means the embedding fallback was used. Skills and feedback are generated through Groq.
4. If upload fails, read the backend log stage (`Analysis failed during ...`). HF may return HTTP 402 when its account has no remaining credits; this is separate from Groq availability.

This UI check exercises authentication, multipart PDF upload, text extraction, providers, and MongoDB persistence. Use a test account and anonymized sample text.

There are two levels of checks:

1. `npm test` runs offline Jest checks, including three synthetic resume/job-description examples. These validate that the code runs and ranks these hand-written examples sensibly. They are not a measure of real-world accuracy.
2. `npm run evaluate -- evaluation-data.local.json` compares the app's predictions with human labels. The JSON must contain a non-empty array of objects with `resumeText`, `jdText`, `expectedScore` (0–100), `expectedResumeSkills`, and `expectedJdSkills`.

## Creating a real evaluation set

Use resumes and job descriptions you have permission to process. Remove names, email addresses, phone numbers, addresses, and company/client identifiers. For each pair, have a person independently rate fit from 0 (not a fit) to 100 (excellent fit), and list the skills explicitly present in each text. Start with at least 20 varied pairs; 50 or more gives a more useful first signal. Keep the expected score and skill lists as human labels, not values copied from the app output.

Example row:

```json
[
  {
    "id": "pair-001",
    "resumeText": "Anonymized resume text...",
    "jdText": "Anonymized job description...",
    "expectedScore": 72,
    "expectedResumeSkills": ["Node.js", "PostgreSQL"],
    "expectedJdSkills": ["NodeJS", "PostgreSQL", "Docker"]
  }
]
```

Save the file as `backend/evaluation-data.local.json` (it is git-ignored), then run:

```powershell
cd backend
npm run evaluate -- evaluation-data.local.json
```

The evaluator reports score MAE/RMSE (lower is better), correlation, and skill extraction precision/recall/F1 (higher is better). It calls the configured AI services to extract skills. That can consume provider quota and transmits the text to the configured provider, so do not use confidential or identifiable records. When Hugging Face is unavailable, the embedding score falls back to local text overlap and is labeled accordingly. Review enough cases manually before changing score weights or making accuracy claims.
