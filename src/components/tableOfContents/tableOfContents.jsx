import './tableOfContents.css';



export default function TableOfContents() {
  const sections = [
    { id: "project-body", label: "Project module" },
    { id: "project-description", label: "What is this thing?" },
    { id: "how-to-use",         label: "How do I use this?" },
    { id: "improvements",       label: "What can still be improved?" },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav aria-label="Table of contents" className="toc-card">
      <p className="toc-label">On this page</p>
      <ul className="toc-list">
        {sections.map(({ id, label }, i) => (
          <li key={id}>
            <button onClick={() => scrollTo(id)} className="toc-item">
              <span className="toc-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="toc-text">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}