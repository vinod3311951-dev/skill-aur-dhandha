# Skill Aur Dhandha — Indian-language Voice Architecture

## Frozen user promise

Voice input in the user's chosen Indian language → understand/transcribe → app response in the same language as text → optional spoken response in that same language.

This is a release requirement, not a claim that the current browser-only prototype already provides production-grade coverage.

## Production pipeline

1. User chooses language or the voice service detects it where supported.
2. ASR converts speech to text in that language.
3. App logic operates on the normalized intent/data without changing frozen safety boundaries.
4. User-facing response is translated/generated in the selected language.
5. The same localized response is rendered as text.
6. TTS speaks that exact localized response when the user requests audio.
7. If a service/language/device is unavailable, keep the text workflow usable and disclose the fallback instead of pretending coverage.

## Provider strategy

Primary production candidate: BHASHINI, subject to current API onboarding, credentials, terms, quotas, latency and commercial/deployment verification before release. Official BHASHINI material describes multilingual voice/text systems using language detection, ASR, translation, response generation and translated text/synthesized-speech delivery.

Open-source/fallback research candidate: AI4Bharat. Its published work covers all-22-scheduled-language machine translation (IndicTrans2), transliteration (IndicXlit), ASR and speech synthesis. Any model/API selected for production still requires license, hosting, performance and privacy review.

Do not embed provider secrets in the PWA client. Production credentials belong behind a server/edge proxy with least privilege, rate limits and no unnecessary audio retention.

## Current client foundation

`src/voice.ts` provides progressive enhancement using browser SpeechRecognition/webkitSpeechRecognition and SpeechSynthesis where available. It supports locale selection, speech-to-text handoff, select matching and same-locale speech playback. Browser capability varies by device and is therefore a fallback/prototype layer, not the production coverage guarantee.

## Language scope

Architecture target: India's 22 scheduled languages, plus practical Romanized input/transliteration where technically supported. Rollout must be capability-tested language by language. A language is not marked production-ready until ASR, text localization and TTS are verified on representative Android/mobile browsers.

## Privacy and safety

- No always-on microphone.
- User explicitly initiates voice capture.
- Do not store raw audio by default.
- Do not request identity data for voice use.
- Keep calculations, official-source cautions and non-guarantee wording semantically equivalent after translation.
- Government/tax/legal destination names and current rules must remain source-grounded; translation must not invent eligibility, fees, deadlines or benefits.

## Acceptance gate

For every production-ready language test: spoken input is captured accurately enough for the task; transcript is visible/editable before consequential use where appropriate; response text is in the same selected language; TTS reads the localized response; fallback is explicit when unsupported; no provider secret is shipped to the browser; and the English meaning/safety boundaries survive translation.