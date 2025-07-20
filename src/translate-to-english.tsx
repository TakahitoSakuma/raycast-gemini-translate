import React, { useState, useEffect, useCallback } from "react";
import { Detail, ActionPanel, Action, Icon, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { Preferences, getInputText, callGemini } from "./utils";

export default function Command() {
  // 状態管理用フック
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0); // 再実行トリガー

  // 翻訳処理を useCallback でラップ
  const translate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setText("");

    try {
      const preferences = getPreferenceValues<Preferences>();
      
      // 認証方法に応じた必須パラメータのチェック
      if (preferences.authMethod === "api_key" && !preferences.geminiApiKey) {
        throw new Error("Gemini API Key is required for API Key authentication. Please set it in preferences.");
      }
      if (preferences.authMethod === "vertex_ai" && (!preferences.gcpProjectId || !preferences.gcpLocation)) {
        throw new Error("Google Cloud Project ID and Location are required for Vertex AI authentication. Please set them in preferences.");
      }
      if (!preferences.geminiModel) {
        throw new Error("Gemini Model not configured in preferences.");
      }

      const inputText = await getInputText(); // "No Text Selected" がスローされる可能性

      await showToast(Toast.Style.Animated, "Translating to English...");

      const prompt = `Act as a software engineer translating Japanese text for an English-speaking colleague. Translate the following text accurately, preserving the original meaning and nuance.

      **Guideline for Technical Terms:**
      * **Use precise engineering vocabulary (e.g., merge, deploy, commit, PR) ONLY IF the Japanese text explicitly mentions or clearly implies these specific software development actions.**
      * **Do NOT insert technical jargon if the source text is general conversation, feedback, project status updates, or doesn't relate to specific code/deployment changes.** The goal is natural communication.
      * Prioritize a translation that sounds natural for communication between colleagues based *on the source text*.
      * Use common abbreviations like 'PR' for 'pull request' when appropriate technical terms are used based on the above guideline.

      Output only the translated English text:\n\n${inputText}`;

      const translatedText = await callGemini(prompt, preferences);

      setText(translatedText);
      await showToast(Toast.Style.Success, "Translation Complete");
    } catch (err) {
      console.error("Translation Error:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      if (message === "No Text Selected") {
        setError(message);
        await showToast(Toast.Style.Failure, "No Text Selected", "Please select text before running the command.");
      } else {
        setError(message);
        await showFailureToast(message, { title: "Translation Failed" });
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback の依存配列は空

  // コンポーネントマウント時と refreshKey 変更時に実行
  useEffect(() => {
    translate();
  }, [refreshKey, translate]); // refreshKey と translate を依存配列に追加

  // エラー表示 ("No Text Selected")
  if (error && error === "No Text Selected") {
    return (
      <Detail
        markdown={`# No Text Selected\n\nPlease select some text in another application and try again.`}
        actions={
          <ActionPanel>
            <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={() => setRefreshKey(k => k + 1)} shortcut={{ modifiers: ["cmd"], key: "r" }}/>
          </ActionPanel>
        }
      />
    );
  }
  // その他のエラー表示
  if (error) {
    return (
      <Detail
        markdown={`# Error\n\n${error}`}
        actions={
          <ActionPanel>
            <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={() => setRefreshKey(k => k + 1)} shortcut={{ modifiers: ["cmd"], key: "r" }}/>
            <Action.CopyToClipboard title="Copy Error Message" content={error} />
          </ActionPanel>
        }
      />
    );
  }

  // ローディング中または翻訳結果の表示
  return (
    <Detail
      isLoading={isLoading}
      markdown={text}
      actions={
        <ActionPanel>
          {!isLoading && text && (
            <>
              <Action.CopyToClipboard title="Copy English Translation" content={text} />
              <Action.Paste title="Paste English Translation" content={text} />
            </>
          )}
          {/* Refreshアクションは常に表示 */}
          <Action title="Refresh Translation" icon={Icon.ArrowClockwise} onAction={() => setRefreshKey(k => k + 1)} shortcut={{ modifiers: ["cmd"], key: "r" }}/>
        </ActionPanel>
      }
    />
  );
}
