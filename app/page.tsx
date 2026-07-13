export default function Home() {
  return <main>
    <h1>BeSafe 登山留守</h1>
    <p>請先以 LINE 登入；本機未設定 LINE 憑證時，只能使用明確的開發測試流程，不能偽裝為 LINE 登入。</p>
    <nav aria-label="主要操作">
      <a href="/trips/new">建立行程</a>
      <a href="/trips/new#start">開始登山</a>
      <a href="/trips/new#progress">進度回報</a>
      <a href="/trips/new#finish">安全下山</a>
    </nav>
    <p aria-label="警示標示">警示標示：正常、留意、紅色警示</p>
  </main>;
}
