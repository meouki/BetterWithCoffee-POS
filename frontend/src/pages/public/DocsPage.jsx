import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, ArrowLeft, ChevronRight, Menu, X, ExternalLink } from 'lucide-react';
import styles from './DocsPage.module.css';

const DOC_SECTIONS = [
    {
        group: 'Getting Started',
        items: [
            { id: 'getting-started', label: 'Getting Started', file: '/docs/GETTING-STARTED.md' },
            { id: 'configuration',   label: 'Configuration',   file: '/docs/CONFIGURATION.md' },
            { id: 'deployment',      label: 'Deployment',      file: '/docs/DEPLOYMENT.md' },
        ],
    },
    {
        group: 'Reference',
        items: [
            { id: 'architecture', label: 'Architecture',  file: '/docs/ARCHITECTURE.md' },
            { id: 'api',          label: 'API Reference', file: '/docs/API.md' },
            { id: 'development',  label: 'Development',   file: '/docs/DEVELOPMENT.md' },
            { id: 'testing',      label: 'Testing',       file: '/docs/TESTING.md' },
        ],
    },
];

const ALL_ITEMS = DOC_SECTIONS.flatMap(s => s.items);

export default function DocsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeId = searchParams.get('doc') || 'getting-started';
    const activeItem = ALL_ITEMS.find(i => i.id === activeId) || ALL_ITEMS[0];

    useEffect(() => {
        setLoading(true);
        fetch(activeItem.file)
            .then(r => r.text())
            .then(text => {
                // Strip the GSD marker comment
                const cleaned = text.replace(/<!--\s*GSD:[^\s]*\s*-->\n?/, '');
                setContent(cleaned);
                setLoading(false);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setContent('# Document Not Found\n\nThis document could not be loaded. Please check that the docs have been generated.');
                setLoading(false);
            });
    }, [activeItem.file]);

    const navigate = (id) => {
        setSearchParams({ doc: id });
        setSidebarOpen(false);
    };

    const currentIndex = ALL_ITEMS.findIndex(i => i.id === activeId);
    const prevItem = ALL_ITEMS[currentIndex - 1];
    const nextItem = ALL_ITEMS[currentIndex + 1];

    return (
        <div className={styles.docsPage}>
            {/* Top Nav */}
            <nav className={styles.topNav}>
                <div className={styles.topNavInner}>
                    <div className={styles.topNavLeft}>
                        <button
                            className={styles.mobileMenuBtn}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <Link to="/" className={styles.backLink}>
                            <ArrowLeft size={16} />
                            <span>PulsePoint</span>
                        </Link>
                        <span className={styles.navDivider}>/</span>
                        <span className={styles.navSection}>
                            <BookOpen size={14} />
                            Docs
                        </span>
                    </div>
                    <div className={styles.topNavRight}>
                        <Link to="/login" className={styles.navCTA}>
                            Access Admin <ExternalLink size={13} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            <div className={styles.layout}>
                {/* Sidebar */}
                <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <BookOpen size={18} className={styles.sidebarIcon} />
                        <span className={styles.sidebarTitle}>Documentation</span>
                    </div>
                    <nav className={styles.sidebarNav}>
                        {DOC_SECTIONS.map(section => (
                            <div key={section.group} className={styles.sidebarGroup}>
                                <p className={styles.sidebarGroupLabel}>{section.group}</p>
                                {section.items.map(item => (
                                    <button
                                        key={item.id}
                                        id={`doc-link-${item.id}`}
                                        className={`${styles.sidebarLink} ${activeId === item.id ? styles.sidebarLinkActive : ''}`}
                                        onClick={() => navigate(item.id)}
                                    >
                                        <ChevronRight size={12} className={styles.sidebarChevron} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.contentWrapper}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingBar} />
                                <div className={styles.loadingBar} style={{ width: '75%' }} />
                                <div className={styles.loadingBar} style={{ width: '60%' }} />
                                <div className={styles.loadingBar} style={{ width: '80%', marginTop: '2rem' }} />
                                <div className={styles.loadingBar} style={{ width: '55%' }} />
                            </div>
                        ) : (
                            <article className={styles.article}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
                                        h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
                                        h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
                                        p:  ({ children }) => <p className={styles.p}>{children}</p>,
                                        a:  ({ href, children }) => <a href={href} className={styles.a} target="_blank" rel="noopener noreferrer">{children}</a>,
                                        ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
                                        ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
                                        li: ({ children }) => <li className={styles.li}>{children}</li>,
                                        code: ({ inline, children }) =>
                                            inline
                                                ? <code className={styles.inlineCode}>{children}</code>
                                                : <code className={styles.codeBlock}>{children}</code>,
                                        pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
                                        blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
                                        table: ({ children }) => <div className={styles.tableWrapper}><table className={styles.table}>{children}</table></div>,
                                        thead: ({ children }) => <thead className={styles.thead}>{children}</thead>,
                                        th: ({ children }) => <th className={styles.th}>{children}</th>,
                                        td: ({ children }) => <td className={styles.td}>{children}</td>,
                                        hr: () => <hr className={styles.hr} />,
                                        strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </article>
                        )}

                        {/* Prev / Next Navigation */}
                        {!loading && (
                            <div className={styles.pageNav}>
                                {prevItem ? (
                                    <button className={styles.pageNavBtn} onClick={() => navigate(prevItem.id)}>
                                        <span className={styles.pageNavLabel}>← Previous</span>
                                        <span className={styles.pageNavTitle}>{prevItem.label}</span>
                                    </button>
                                ) : <div />}
                                {nextItem ? (
                                    <button className={`${styles.pageNavBtn} ${styles.pageNavBtnNext}`} onClick={() => navigate(nextItem.id)}>
                                        <span className={styles.pageNavLabel}>Next →</span>
                                        <span className={styles.pageNavTitle}>{nextItem.label}</span>
                                    </button>
                                ) : <div />}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
