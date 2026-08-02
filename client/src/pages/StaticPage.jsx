export default function StaticPage({ title, text }) {
  return (
    <main className="page container">
      <h1 className="page-title">{title}</h1>
      <p className="page-text">{text}</p>
    </main>
  );
}
