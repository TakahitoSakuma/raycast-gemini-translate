// src/utils.ts
import { getSelectedText } from "@raycast/api";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentRequest } from "@google/generative-ai";
import { GoogleAuth } from "google-auth-library";

export interface Preferences {
  authMethod: "api_key" | "vertex_ai";
  geminiApiKey?: string;
  gcpProjectId?: string;
  gcpLocation?: string;
  geminiModel: string;
}

// Google Cloud認証のためのヘルパー関数
async function getGoogleCloudAccessToken(): Promise<string> {
  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to obtain access token");
    }

    return accessToken.token;
  } catch {
    throw new Error(
      'Failed to get Google Cloud access token. Please ensure you are authenticated with Google Cloud (run "gcloud auth application-default login").',
    );
  }
}

// Vertex AI REST APIを呼び出す関数
async function callVertexAI(prompt: string, projectId: string, location: string, modelName: string): Promise<string> {
  try {
    const accessToken = await getGoogleCloudAccessToken();

    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Invalid response format from Vertex AI");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while calling Vertex AI");
  }
}

// 入力テキストを取得する関数
export async function getInputText(): Promise<string> {
  let inputText = "";
  try {
    inputText = await getSelectedText();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.info("No text selected.");
    throw new Error("No Text Selected");
  }
  if (!inputText.trim()) {
    throw new Error("No Text Selected");
  }
  return inputText.trim();
}

// 統合されたGemini API呼び出し関数
export async function callGemini(prompt: string, preferences: Preferences): Promise<string> {
  const { authMethod, geminiApiKey, gcpProjectId, gcpLocation, geminiModel } = preferences;

  // 認証方法に応じた必須パラメータの検証
  if (authMethod === "api_key") {
    if (!geminiApiKey) {
      throw new Error("Gemini API Key is required for API Key authentication. Please set it in preferences.");
    }
    return await callGeminiWithApiKey(prompt, geminiApiKey, geminiModel);
  } else if (authMethod === "vertex_ai") {
    if (!gcpProjectId || !gcpLocation) {
      throw new Error(
        "Google Cloud Project ID and Location are required for Vertex AI authentication. Please set them in preferences.",
      );
    }
    return await callVertexAI(prompt, gcpProjectId, gcpLocation, geminiModel);
  } else {
    throw new Error("Invalid authentication method specified.");
  }
}

// API Key を使った Gemini API 呼び出し（従来の実装）
async function callGeminiWithApiKey(prompt: string, apiKey: string, modelName: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const generationRequest: GenerateContentRequest = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: safetySettings,
    };

    const result = await model.generateContent(generationRequest);
    const response = result.response;

    let outputText = "";
    if (response && typeof response.text === "function") {
      outputText = response.text().trim();
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      outputText = response.candidates[0].content.parts[0].text.trim();
    }

    if (!outputText && response?.promptFeedback?.blockReason) {
      console.warn("Blocked by safety settings:", response.promptFeedback);
      throw new Error(`Blocked due to safety settings (${response.promptFeedback.blockReason}).`);
    } else if (!outputText) {
      console.warn("Response structure might have changed or text is empty:", response);
      throw new Error("Could not extract valid text from response.");
    }
    return outputText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    let message = "Failed to call Gemini API";
    if (error instanceof Error) {
      if (error.message.includes("SAFETY") || error.message.includes("Blocked due")) {
        message = `Blocked due to safety settings. Please adjust your prompt or safety settings. Reason: ${error.message}`;
      } else if (error.message.includes("API key not valid")) {
        message = "Invalid API Key. Please check your Gemini API Key in preferences.";
      } else {
        message = error.message; // 他のAPIエラー
      }
    }
    // エラーを再スローして呼び出し元で処理する
    throw new Error(message);
  }
}
