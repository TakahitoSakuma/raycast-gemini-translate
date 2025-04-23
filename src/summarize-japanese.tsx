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

  // 要約処理を useCallback でラップ
  const summarize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setText("");

    try {
      const { geminiApiKey, geminiModel } = getPreferenceValues<Preferences>();
      if (!geminiApiKey || !geminiModel) {
        throw new Error("API Key or Model not configured in preferences.");
      }

      const inputText = await getInputText(); // "No Text Selected" がスローされる可能性

      await showToast(Toast.Style.Animated, "Summarizing in Japanese...");

      const prompt = `以下のソフトウェア開発関連テキストの要点を、日本語で簡潔に要約してください。重要な技術的ポイント、決定事項、またはアクションアイテムがわかるようにまとめてください。応答には要約文のみを含め、他の導入、コメント、代替案などは含めないでください:\n\n${inputText}`;
      const summarizedText = await callGemini(prompt, geminiApiKey, geminiModel);

      setText(summarizedText);
      await showToast(Toast.Style.Success, "Summarization Complete");
    } catch (err) {
      console.error("Summarization Error:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      if (message === "No Text Selected") {
        setError(message);
        await showToast(Toast.Style.Failure, "No Text Selected", "Please select text before running the command.");
      } else {
        setError(message);
        await showFailureToast(message, { title: "Summarization Failed" });
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback の依存配列は空

  // コンポーネントマウント時と refreshKey 変更時に実行
  useEffect(() => {
    summarize();
  }, [refreshKey, summarize]); // refreshKey と summarize を依存配列に追加

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

  // ローディング中または要約結果の表示
  return (
    <Detail
      isLoading={isLoading}
      markdown={text}
      actions={
        <ActionPanel>
          {!isLoading && text && (
            <>
              <Action.CopyToClipboard title="Copy Summary" content={text} />
              <Action.Paste title="Paste Summary" content={text} />
            </>
          )}
          {/* Refreshアクションは常に表示 */}
          <Action title="Refresh Summary" icon={Icon.ArrowClockwise} onAction={() => setRefreshKey(k => k + 1)} shortcut={{ modifiers: ["cmd"], key: "r" }}/>
        </ActionPanel>
      }
    />
  );
}
