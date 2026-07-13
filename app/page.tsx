import { LiffBootstrap } from './LiffBootstrap';

export default function Home() {
  return <main>
    <h1>BeSafe 登山留守</h1>
    <LiffBootstrap />
    <p>請先以 LINE 登入；本機未設定 LINE 憑證時，只能使用明確的開發測試流程，不能偽裝為 LINE 登入。</p>
    <nav aria-label="主要操作">
      <a href="/trips/new">建立行程</a>
      <a href="/trips/active">開始登山</a>
      <a href="/trips/active#check-in">進度回報</a>
      <a href="/trips/active#finish">安全下山</a>
    </nav>
    <p>請先建立行程；建立後可在該行程頁開始登山、回報進度與安全下山。</p>
    <p aria-label="警示標示">警示標示：正常、留意、紅色警示</p>
  </main>;
}
