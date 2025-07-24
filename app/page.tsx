"use client";

import React, { useEffect, useState } from "react";
import data from "../public/nerai_me_list.json";

export type DataItem = {
  機種名: string;
  ID: string;
  状態: string;
  投資区分: string;
  資金帯: string;
  閉店時間: string;
  大見出し: string;
  中見出し: string;
  小見出し: string;
  狙い目: string | number;
  リンク: string;
  差枚?: string;
  その他条件1?: string;
  その他条件2?: string;
};

const Home = () => {
  const [selectedMachine, setSelectedMachine] = useState("");
  const [state, setState] = useState("");
  const [investment, setInvestment] = useState("");
  const [budget, setBudget] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);

  const machines = Array.from(new Set(data.map((item) => item.機種名)));

  const handleSearch = () => {
    const result = data.filter((item) => {
      return (
        (!selectedMachine || item.機種名 === selectedMachine) &&
        (!state || item.状態 === state) &&
        (!investment || item.投資区分 === investment) &&
        (!budget || item.資金帯 === budget) &&
        (!closingTime || item.閉店時間 === closingTime)
      );
    });
    setFilteredData(result);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
        狙い目早見表
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)}>
          <option value="">機種を選択</option>
          {machines.map((machine) => (
            <option key={machine} value={machine}>{machine}</option>
          ))}
        </select>

        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">状態を選択</option>
          <option value="リセ後">リセ後</option>
          <option value="AT後">AT後</option>
        </select>

        <select value={investment} onChange={(e) => setInvestment(e.target.value)}>
          <option value="">投資区分を選択</option>
          <option value="再プレイ">再プレイ</option>
          <option value="現金">現金</option>
        </select>

        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">資金帯を選択</option>
          <option value="10万円以上">10万円以上</option>
          <option value="20万円以上">20万円以上</option>
        </select>

        <select value={closingTime} onChange={(e) => setClosingTime(e.target.value)}>
          <option value="">閉店時間非考慮</option>
          <option value="考慮">考慮</option>
        </select>

        <button onClick={handleSearch} style={{ padding: "10px", backgroundColor: "#0055ff", color: "white", fontWeight: "bold", border: "none", borderRadius: "4px" }}>
          検索
        </button>
      </div>

      <div style={{ marginTop: "30px" }}>
        {filteredData.length > 0 &&
          filteredData.reduce((acc: JSX.Element[], item, index, arr) => {
            const showHeader = index === 0 || item.大見出し !== arr[index - 1].大見出し;
            const showSubHeader = index === 0 || item.中見出し !== arr[index - 1].中見出し;
            acc.push(
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {showHeader && <h2 style={{ color: "#000", fontWeight: "bold" }}>{item.大見出し}</h2>}
                {showSubHeader && <h3 style={{ color: "#555", fontWeight: "normal" }}>{item.中見出し}</h3>}

                <div style={{ marginTop: "10px" }}>
                  <strong>{item.小見出し}</strong>
                  <div>
                    <a
                      href={item.リンク}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0066cc", textDecoration: "underline" }}
                    >
                      打ち方や各種示唆はこちら
                    </a>
                  </div>
                  <div style={{ color: "#ff0066", fontWeight: "bold" }}>🎯 {item.狙い目}</div>
                  {item.差枚 && <div>差枚: {item.差枚}</div>}
                  {item.その他条件1 && <div>{item.その他条件1}</div>}
                  {item.その他条件2 && <div>{item.その他条件2}</div>}
                </div>
              </div>
            );
            return acc;
          }, [])}
      </div>
    </div>
  );
};

export default Home;
