"use client";

import { useEffect, useState } from 'react';
import data from "../public/nerai_me_list.json";

type DataItem = {
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
  狙い目: string;
  補足: string;
  ツール: string;
  PASS: string;
  ツール2: string;
  PASS2: string;
  "打ち方、示唆など": string;
};

export default function Home() {
  const [machineName, setMachineName] = useState("");
  const [state, setState] = useState("");
  const [investment, setInvestment] = useState("");
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);

  const machineList = Array.from(new Set(data.map((item) => item["機種名"]))).sort();
  const stateList = Array.from(new Set(data.filter(item => item["機種名"] === machineName).map(item => item["状態"])));
  const investmentList = Array.from(new Set(data.filter(item => item["機種名"] === machineName && item["状態"] === state).map(item => item["投資条件"])));

  useEffect(() => {
    if (machineName && state && investment) {
      const result = data.filter(
        (item) =>
          item["機種名"] === machineName &&
          item["状態"] === state &&
          item["投資条件"] === investment
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [machineName, state, investment]);

  return (
    <main className="p-4 space-y-4">
      <div>
        <label className="block font-bold">機種名</label>
        <select
          value={machineName}
          onChange={(e) => {
            setMachineName(e.target.value);
            setState("");
            setInvestment("");
          }}
          className="border p-1"
        >
          <option value="">選択してください</option>
          {machineList.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {machineName && (
        <div>
          <label className="block font-bold">状態</label>
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setInvestment("");
            }}
            className="border p-1"
          >
            <option value="">選択してください</option>
            {stateList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {machineName && state && (
        <div>
          <label className="block font-bold">投資条件</label>
          <select
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="border p-1"
          >
            <option value="">選択してください</option>
            {investmentList.map((inv) => (
              <option key={inv} value={inv}>{inv}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        {filteredData.map((item, index) => (
          <div key={index} className="border p-2 my-2 bg-white rounded shadow">
            <p className="text-blue-700 font-semibold">{item["大見出し"]} ＞ {item["中見出し"]}</p>
            <p className="font-bold">{item["小見出し"]}</p>
            {item["リンク"] && <a href={item["リンク"]} className="text-blue-500 underline" target="_blank">ツールはこちら</a>}
            {item["PASS"] && <p className="text-sm text-gray-600">PASS：{item["PASS"]}</p>}
            {item["PASS2"] && <p className="text-sm text-gray-600">PASS2：{item["PASS2"]}</p>}
            <p className="text-lg my-1">🎯 狙い目：{item["狙い目"]}</p>
            {item["差枚"] && <p className="text-sm">差枚：{item["差枚"]}</p>}
            {item["その他条件"] && <p className="text-sm">{item["その他条件"]}</p>}
            {item["その他条件2"] && <p className="text-sm">{item["その他条件2"]}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
