"use client";

import { useEffect, useState } from "react";

const PASS_HASH_HEX = process.env.NEXT_PUBLIC_PASS_HASH ?? "";
const TOKEN_KEY = "slottool-auth-v1";

async function sha256Hex(text: string) {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    setOk(token === "1");
  }, []);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const hex = await sha256Hex(input);
    if (hex === PASS_HASH_HEX) {
      sessionStorage.setItem(TOKEN_KEY, "1");
      setOk(true);
    } else {
      alert("パスワードが違います");
    }
  };

  if (ok === null) return null;

  if (!ok) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>パスワードを入力してください</h2>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          <button type="submit">入室</button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
