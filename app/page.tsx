"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import styles from "./page.module.css";

type Screen = "top" | "yes" | "no" | "print";
type PrintSource = "yes" | "no" | null;
type BarcodeSize = "preview" | "tag" | "package" | "seal";

function onlyDigits(value: string, max: number) {
  return value.replace(/\D/g, "").slice(0, max);
}

function formatPrice(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ja-JP");
}

function calcJan13CheckDigit(first12: string) {
  const nums = first12.split("").map(Number);
  const sum = nums.reduce((total, num, index) => {
    return total + num * (index % 2 === 0 ? 1 : 3);
  }, 0);
  return String((10 - (sum % 10)) % 10);
}

function makeJanFromEos(eos7: string) {
  if (eos7.length !== 7) return "";
  const first12 = `23000${eos7}`;
  return first12 + calcJan13CheckDigit(first12);
}

function Barcode({
  value,
  size = "preview",
}: {
  value: string;
  size?: BarcodeSize;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || value.length !== 13) return;

    JsBarcode(svgRef.current, value, {
      format: "EAN13",
      displayValue: true,
      margin: 0,
      width:
        size === "tag"
          ? 1.35
          : size === "package"
          ? 1.05
          : size === "seal"
          ? 1.2
          : 1.7,
      height:
        size === "tag"
          ? 42
          : size === "package"
          ? 34
          : size === "seal"
          ? 24
          : 78,
      fontSize:
        size === "tag"
          ? 11
          : size === "package"
          ? 9
          : size === "seal"
          ? 7
          : 13,
    });
  }, [value, size]);

  if (value.length !== 13) {
    return <div className={styles.barcodePlaceholder}></div>;
  }

  return <svg ref={svgRef} className={styles.barcodeSvg} />;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("top");
  const [printSource, setPrintSource] = useState<PrintSource>(null);

  const [yesEos5, setYesEos5] = useState("");
  const [yesEos2, setYesEos2] = useState("");
  const [yesPrice, setYesPrice] = useState("");

  const [noJan, setNoJan] = useState("");
  const [noEos5, setNoEos5] = useState("");
  const [noEos2, setNoEos2] = useState("");
  const [noPrice, setNoPrice] = useState("");

  const yesEos2Ref = useRef<HTMLInputElement | null>(null);
  const noEos2Ref = useRef<HTMLInputElement | null>(null);

  const yesEos7 = `${yesEos5}${yesEos2}`;
  const noEos7 = `${noEos5}${noEos2}`;

  const yesJan = makeJanFromEos(yesEos7);
  const noJanCode = noJan.length === 13 ? noJan : "";

  const activeJan = printSource === "yes" ? yesJan : noJanCode;
  const activeEos5 = printSource === "yes" ? yesEos5 : noEos5;
  const activeEos2 = printSource === "yes" ? yesEos2 : noEos2;
  const activePrice = printSource === "yes" ? yesPrice : noPrice;

  const activeEos = activeEos5 && activeEos2 ? `${activeEos5}-${activeEos2}` : "";
  const logoNumber = activeEos5 ? `${activeEos5.slice(0, 1)}0` : "";

  function handleYesEos5(value: string) {
    const next = onlyDigits(value, 5);
    setYesEos5(next);
    if (next.length === 5) {
      setTimeout(() => yesEos2Ref.current?.focus(), 0);
    }
  }

  function handleNoEos5(value: string) {
    const next = onlyDigits(value, 5);
    setNoEos5(next);
    if (next.length === 5) {
      setTimeout(() => noEos2Ref.current?.focus(), 0);
    }
  }

  function issueFromYes() {
    if (yesEos7.length !== 7) {
      alert("EOSコード7桁を入力してください。");
      return;
    }
    if (!yesPrice) {
      alert("金額を入力してください。");
      return;
    }

    setPrintSource("yes");
    setScreen("print");
  }

  function issueFromNo() {
    if (noJan.length !== 13) {
      alert("JANコード13桁を入力してください。");
      return;
    }
    if (noEos7.length !== 7) {
      alert("EOSコード7桁を入力してください。");
      return;
    }
    if (!noPrice) {
      alert("金額を入力してください。");
      return;
    }

    setPrintSource("no");
    setScreen("print");
  }

function clearAllInputs() {
  setYesEos5("");
  setYesEos2("");
  setYesPrice("");

  setNoJan("");
  setNoEos5("");
  setNoEos2("");
  setNoPrice("");

  setPrintSource(null);
}

  return (
    <main className={styles.app}>
      {screen === "top" && (
        <section className={styles.ipadPage}>
          <div className={styles.header}>バーコード作成アプリ</div>

          <div className={styles.questionBox}>
            JANコードが<span>「23000」</span>から始まる商品ですか？
          </div>

          <button className={styles.yesButton} onClick={() => setScreen("yes")}>
            YES
          </button>

          <button className={styles.noButton} onClick={() => setScreen("no")}>
            NO
          </button>

          <button className={styles.clearButton} onClick={clearAllInputs}>
  クリア
</button>
        </section>
      )}

      {screen === "yes" && (
        <section className={styles.ipadPage}>
          <div className={styles.header}>バーコード作成アプリ</div>

          <button className={styles.backButton} onClick={() => setScreen("top")}>
            戻る
          </button>

          <div className={styles.guideTextYes}>●EOSコード（7桁）を入力してください</div>

          <div className={styles.yesEosArea}>
            <input
              className={styles.eos5Input}
              value={yesEos5}
              onChange={(e) => handleYesEos5(e.target.value)}
              inputMode="numeric"
            />
            <span className={styles.hyphen}>-</span>
            <input
              ref={yesEos2Ref}
              className={styles.eos2Input}
              value={yesEos2}
              onChange={(e) => setYesEos2(onlyDigits(e.target.value, 2))}
              inputMode="numeric"
            />
          </div>

          <div className={styles.arrowYes}>»»»</div>

          <div className={styles.previewBarcodeYes}>
            <Barcode value={yesJan} size="preview" />
          </div>

          <div className={styles.yesNote}>
            値札用バーコードを印刷する場合は
            <br />
            商品の金額を入力後「発行」ボタンを押してください
          </div>

          <div className={styles.yenCircle}>￥</div>

          <input
            className={styles.yesPriceInput}
            value={yesPrice}
            onChange={(e) => setYesPrice(formatPrice(e.target.value))}
            inputMode="numeric"
          />

          <button className={styles.issueButtonYes} onClick={issueFromYes}>
            発行
          </button>
        </section>
      )}

      {screen === "no" && (
        <section className={styles.ipadPage}>
          <div className={styles.header}>バーコード作成アプリ</div>

          <button className={styles.backButton} onClick={() => setScreen("top")}>
            戻る
          </button>

          <div className={styles.guideTextNo}>●JANコード（13桁）を入力してください</div>

          <input
            className={styles.janInput}
            value={noJan}
            onChange={(e) => setNoJan(onlyDigits(e.target.value, 13))}
            inputMode="numeric"
          />

          <div className={styles.arrowNo}>»»</div>

          <div className={styles.previewBarcodeNo}>
            <Barcode value={noJanCode} size="preview" />
          </div>

          <div className={styles.noNote}>
            値札用バーコードを印刷する場合は、EOSコード（7桁）と
            <br />
            商品の金額を入力後「発行」ボタンを押してください
          </div>

          <div className={styles.eosCircle}>EOS</div>

          <div className={styles.noEosArea}>
            <input
              className={styles.eos5Input}
              value={noEos5}
              onChange={(e) => handleNoEos5(e.target.value)}
              inputMode="numeric"
            />
            <span className={styles.hyphen}>-</span>
            <input
              ref={noEos2Ref}
              className={styles.eos2Input}
              value={noEos2}
              onChange={(e) => setNoEos2(onlyDigits(e.target.value, 2))}
              inputMode="numeric"
            />
          </div>

          <div className={styles.yenCircleNo}>￥</div>

          <input
            className={styles.noPriceInput}
            value={noPrice}
            onChange={(e) => setNoPrice(formatPrice(e.target.value))}
            inputMode="numeric"
          />

          <button className={styles.issueButtonNo} onClick={issueFromNo}>
            発行
          </button>
        </section>
      )}

      {screen === "print" && (
        <section className={styles.printScreen}>
          <div className={styles.printCanvas}>
            <div className={styles.header}>バーコード作成アプリ</div>

            <button className={styles.printButton} onClick={() => window.print()}>
              印刷
            </button>

            <button className={styles.topButton} onClick={() => setScreen("top")}>
              トップへ戻る
            </button>

            <div className={styles.printTitleTag}>タグ用（2.38×4.5）</div>
            <div className={styles.printTitlePackage}>パッケージ用（1.68×5.93）</div>
            <div className={styles.printTitleSeal}>シール用（1.23×5.06）</div>

            <div className={styles.tagColumn}>
              {[1, 2, 3, 4].map((item) => (
                <div className={styles.tagLabel} key={item}>
                  <Barcode value={activeJan} size="tag" />
                </div>
              ))}
            </div>

            <div className={styles.packageColumn}>
              {[1, 2, 3, 4].map((item) => (
                <div className={styles.packageLabel} key={item}>
                  <Barcode value={activeJan} size="package" />
                </div>
              ))}
            </div>

            <div className={styles.sealColumn}>
              {[1, 2].map((item) => (
                <div className={styles.sealLabel} key={item}>
                  <img
                    src="/workman-logo.png"
                    alt="WORKMAN"
                    className={styles.workmanLogoImage}
                  />

                  <div className={styles.sealNumber}>{logoNumber}</div>
                  <div className={styles.sealEos}>{activeEos}</div>

                  <div className={styles.taxText}>税込</div>
                  <div className={styles.sealPrice}>¥{activePrice}</div>

                  <div className={styles.sealBarcode}>
                    <Barcode value={activeJan} size="seal" />
                  </div>

                  <div className={styles.sealBottomLine} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}