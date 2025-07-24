// 修正済みの page.tsx（Next.js 13+ app router 用）
"use client";

import React from "react";
import { useEffect, useState } from "react";
import data from "../public/nerai_me_list.json";

export type DataItem = {
  機種名: string;
  ID: string;
  五十音: string;
  状態: string;
  投資条件: string;
  大見出し: string;
  中見出し: string;
  小見出し: string;
  差枚: string;
  その他条件: string;
  その他条件2: string;
  狙い目: string | number;
  補足: string;
  ツール: string;
  PASS: string;
  ツール2: string;
  PASS2: string;
  "打ち方、示唆など": string;
};

export default function Home() {
  const [machine, setMachine] = useState("");
  const [status, setStatus] = useState("");
  const [investment, setInvestment] = useState("");
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);

  const machineList = Array.from(new Set(data.map((d) => d.機種名))).sort();
  const statusList = Array.from(new Set(data.filter(d => d.機種名 === machine).map(d => d.状態)));
  const investmentList = Array.from(new Set(data.filter(d => d.機種名 === machine && d.状態 === status).map(d => d.投資条件)));

  useEffect(() => {
    if (machine && status && investment) {
      const result = data.filter(d =>
        d.機種名 === machine &&
        d.状態 === status &&
        d.投資条件 === investment
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [machine, status, investment]);

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-center mb-6">狙い目早見表</h1>

      <div className="space-y-4">
        <select className="w-full border p-2" value={machine} onChange={(e) => { setMachine(e.target.value); setStatus(""); setInvestment(""); }}>
          <option value="">機種を選択</option>
          {machineList.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        {machine && (
          <select className="w-full border p-2" value={status} onChange={(e) => { setStatus(e.target.value); setInvestment(""); }}>
            <option value="">状態を選択</option>
            {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {status && (
          <select className="w-full border p-2" value={investment} onChange={(e) => setInvestment(e.target.value)}>
            <option value="">投資条件を選択</option>
            {investmentList.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {filteredData.length > 0 && (
          filteredData.reduce((acc: JSX.Element[], item, index, arr) => {
            const showHeader = index === 0 || item.大見出し !== arr[index - 1].大見出し;
            const showSubHeader = index === 0 || item.中見出し !== arr[index - 1].中見出し;
            acc.push(
              <div key={index} className="border rounded-md p-3 shadow bg-white">
                {showHeader && <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-500 pl-2 mb-1">{item.大見出し}</h2>}
                {showSubHeader && <h3 className="text-base font-semibold text-gray-700 ml-2 mb-1">{item.中見出し}</h3>}
                <p className="text-sm ml-4 font-medium">{item.小見出し}</p>
                {item["打ち方、示唆など"] && <a href={item["打ち方、示唆など"]} target="_blank" className="text-blue-600 text-sm ml-4 underline">打ち方や各種示唆はこちら</a>}
                <p className="ml-4">🎯 <b>狙い目：</b>{item.狙い目}</p>
                {item.差枚 && <p className="ml-4 text-sm">差枚：{item.差枚}</p>}
                {item.その他条件 && <p className="ml-4 text-sm">{item.その他条件}</p>}
                {item.その他条件2 && <p className="ml-4 text-sm">{item.その他条件2}</p>}
              </div>
            );
            return acc;
          }, [])
        )}
      </div>
    </main>
  );
}
