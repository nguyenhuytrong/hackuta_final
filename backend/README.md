# Backend notes

This backend uses Google GenAI via the `@google/genai` package for generating chatbot advice.

Authentication options

1) API Key (easy)

- Set the environment variable `GEMINI_API_KEY` (alternatively `GENAI_API_KEY` or `GOOGLE_API_KEY`).

PowerShell example:

```powershell
$env:GEMINI_API_KEY = "YOUR_API_KEY"
```

2) Application Default Credentials (ADC)

- Create a Google Cloud service account with the proper GenAI permissions and download the JSON key file.
- Set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of the JSON file.

PowerShell example:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account.json"
```

If neither method is used, the chatbot will throw a helpful error explaining how to configure credentials.

More info:

https://cloud.google.com/docs/authentication/getting-started
