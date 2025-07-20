# Gemini Tech Translate

Translate and Summarize text using the Google Gemini API directly within Raycast, optimized for technical and software development contexts. Supports both API Key authentication and Vertex AI authentication.

## Features

* **Translate to English:** Translates selected text or text from your clipboard into English.
* **Translate to Japanese:** Translates selected text or text from your clipboard into Japanese.
* **Summarize in Japanese:** Summarizes selected text or text from your clipboard in Japanese.

## Authentication Methods

This extension supports two authentication methods:

### Option 1: API Key Authentication
1. **Obtain an API Key:** Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Configure in Raycast:** 
   - Open Raycast Preferences → Extensions → Gemini Tech Translate
   - Set "Authentication Method" to "API Key"
   - Enter your API key in the "Gemini API Key" field

### Option 2: Vertex AI Authentication (Google Cloud)
1. **Setup Google Cloud:**
   - Have a Google Cloud Project with Vertex AI API enabled
   - Install Google Cloud CLI (`gcloud`)
   - Authenticate: `gcloud auth application-default login`
2. **Configure in Raycast:**
   - Open Raycast Preferences → Extensions → Gemini Tech Translate  
   - Set "Authentication Method" to "Vertex AI (Google Cloud)"
   - Enter your Google Cloud Project ID
   - Enter your preferred location/region (e.g., us-central1, asia-northeast1)

## Model Configuration

The extension defaults to the `gemini-2.0-flash` model. You can change this in the preferences if needed (e.g., `gemini-1.5-pro`, `gemini-1.5-flash`). Refer to the [Google AI Gemini models documentation](https://ai.google.dev/models/gemini) for other available models.

## How to Use

1. Select the text you want to process OR copy it to your clipboard.
2. Activate Raycast and search for one of the extension's commands (e.g., "Translate to English", "Summarize in Japanese") or use the configured keyboard shortcuts:
   * `Cmd + Shift + E`: Translate to English
   * `Cmd + Shift + J`: Translate to Japanese
   * `Cmd + Shift + S`: Summarize in Japanese
3. The result will be displayed in the Raycast window.

---

# Gemini Tech Translate

Google Gemini APIを使用して、Raycast内で直接テキストの翻訳と要約を行う拡張機能です。特にソフトウェア開発の文脈に最適化されています。APIキー認証とVertex AI認証の両方をサポートしています。

## 機能

* **英語に翻訳 (Translate to English):** 選択したテキストまたはクリップボードのテキストを英語に翻訳します。
* **日本語に翻訳 (Translate to Japanese):** 選択したテキストまたはクリップボードのテキストを日本語に翻訳します。
* **日本語で要約 (Summarize in Japanese):** 選択したテキストまたはクリップボードのテキストを日本語で要約します。

## 認証方法

この拡張機能は2つの認証方法をサポートしています：

### 方法1: APIキー認証
1. **APIキーの取得:** [Google AI Studio](https://aistudio.google.com/app/apikey) からAPIキーを取得します。
2. **Raycastでの設定:**
   - Raycast環境設定 → Extensions → Gemini Tech Translate
   - 「Authentication Method」を「API Key」に設定
   - 「Gemini API Key」欄にAPIキーを入力

### 方法2: Vertex AI認証 (Google Cloud)
1. **Google Cloudのセットアップ:**
   - Vertex AI APIが有効なGoogle Cloudプロジェクトを用意
   - Google Cloud CLI (`gcloud`) をインストール
   - 認証を実行: `gcloud auth application-default login`
2. **Raycastでの設定:**
   - Raycast環境設定 → Extensions → Gemini Tech Translate
   - 「Authentication Method」を「Vertex AI (Google Cloud)」に設定
   - Google Cloud Project IDを入力
   - 希望のロケーション/リージョンを入力 (例: us-central1, asia-northeast1)

## モデル設定

デフォルトでは `gemini-2.0-flash` モデルを使用します。必要に応じて、環境設定で他のモデル名（例: `gemini-1.5-pro`, `gemini-1.5-flash`）に変更できます。利用可能なモデルについては、[Google AI Gemini モデルのドキュメント](https://ai.google.dev/models/gemini) を参照してください。

## 使い方

1.  処理したいテキストを選択するか、クリップボードにコピーします。
2.  Raycastを起動し、拡張機能のコマンド名（例: "Translate to English", "Summarize in Japanese"）を検索して実行するか、設定したショートカットキーを使用します:
  * `Cmd + Shift + E`: 英語に翻訳
  * `Cmd + Shift + J`: 日本語に翻訳
  * `Cmd + Shift + S`: 日本語で要約
3.  結果がRaycastのウィンドウに表示されます。

---
