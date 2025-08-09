"use client";

import { useEffect, useState } from "react";

// ← ここで環境変数を正規化（改行・前後空白を除去）
const PASS_HASH_HEX = (process.env.NEXT_PUBLIC_PASS_HASH ?? "").trim();
const TOKEN_KEY = "slottool-auth-v1"; // 全員再ログインさせたい時は v2 などに変更

async function sha256Hex(text: string) {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 入力も正規化（全角→半角、前後空白除去）
function sanitize(s: string) {
  return s.normalize("NFKC").trim();
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    setOk(token === "1");
    // 診断ログ（必要なときだけ見てください）
    console.log("PASS_HASH_HEX (from env) =", PASS_HASH_HEX);
  }, []);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const norm = sanitize(input);
    const hex = await sha256Hex(norm);

    // 診断ログ
    console.log("YOUR_INPUT_HEX =", hex);

    if (hex === PASS_HASH_HEX) {
      sessionStorage.setItem(TOKEN_KEY, "1");
      setOk(true);
    } else {
      // さらに堅牢に：長さも念のため表示（64でないと改行混入の可能性大）
      console.log("LEN input=", hex.length, "LEN env=", PASS_HASH_HEX.length);
      alert("パスワードが違います");
    }
  };

  if (ok === null) return null;

  if (!ok) {
    return (
      <div style={{ padding: 20 }}>
        <h2>パスワードを入力してください</h2>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          <button type="submit" style={{ marginLeft: 12 }}>入室</button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
