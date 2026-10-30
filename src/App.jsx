import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Menu,
  MoveUpRight,
  X,
} from "lucide-react";

const projects = [
  {
    number: "01",
    title: "RuangKita",
    type: "Product design · Web app",
    description:
      "Eksplorasi platform komunitas untuk berbagi ruang, cerita, dan kegiatan lokal.",
    tags: ["React", "Tailwind", "UI/UX"],
    visual: "visual-ruangkita",
    mark: "rk.",
  },
  {
    number: "02",
    title: "Sela Studio",
    type: "Creative direction · Website",
    description:
      "Konsep website studio kreatif dengan pengalaman digital yang hangat dan berkarakter.",
    tags: ["Vite", "Motion", "Responsive"],
    visual: "visual-sela",
    mark: "sela",
  },
  {
    number: "03",
    title: "Daily Habit",
    type: "Personal project · Web app",
    description:
      "Ruang sederhana untuk membangun kebiasaan baik, satu langkah kecil setiap hari.",
    tags: ["JavaScript", "Node.js", "Neon"],
    visual: "visual-habit",
    mark: "today\ncounts.",
  },
];

const skills = [
  "JavaScript",
  "React",
  "Node.js",
  "Tailwind CSS",
  "Motion",
  "PostgreSQL",
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionLabel({ number, children }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span className="section-label-line" />
      <span>{children}</span>
    </div>
  );
}

async function readApiResponse(response, fallbackMessage) {
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`${fallbackMessage} (HTTP ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      result.error || `${fallbackMessage} (HTTP ${response.status})`,
    );
  }

  return result;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState("idle");
  const [formMessage, setFormMessage] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsState, setCommentsState] = useState("loading");
  const [commentFormState, setCommentFormState] = useState("idle");
  const [commentFormMessage, setCommentFormMessage] = useState("");
  const [locationState, setLocationState] = useState("idle");
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadComments() {
      try {
        const response = await fetch("/api/comments");
        const result = await readApiResponse(
          response,
          "Komentar belum berhasil dimuat.",
        );
        if (active) {
          setComments(result.comments);
          setCommentsState("loaded");
        }
      } catch (error) {
        if (active) {
          setCommentsState("error");
          console.error("Failed to load reader comments:", error);
        }
      }
    }

    loadComments();
    return () => {
      active = false;
    };
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationMessage(
        "Browser ini tidak mendukung fitur lokasi. Website tetap bisa diakses.",
      );
      return;
    }

    setLocationState("requesting");
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch("/api/visits/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: coords.latitude,
              longitude: coords.longitude,
              consent: true,
            }),
          });
          await readApiResponse(response, "Lokasi belum berhasil disimpan.");
          setLocationState("success");
          setLocationMessage("");
        } catch (error) {
          console.error("Failed to save visitor location:", error);
          setLocationState("error");
          setLocationMessage(
            error.message ||
              "Lokasi belum berhasil disimpan. Website tetap bisa diakses.",
          );
        }
      },
      (error) => {
        console.error(
          "Location permission was not granted or location is unavailable:",
          error,
        );
        setLocationState(
          error.code === error.PERMISSION_DENIED ? "denied" : "error",
        );
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi tidak diberikan. Kamu tetap bisa menjelajahi website."
            : "Lokasi tidak tersedia saat ini. Kamu tetap bisa menjelajahi website.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormState("sending");
    setFormMessage("");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await readApiResponse(response, "Pesan belum berhasil dikirim.");

      setFormState("success");
      setFormMessage("Terima kasih! Pesanmu sudah terkirim.");
      form.reset();
    } catch (error) {
      setFormState("error");
      setFormMessage(error.message || "Terjadi kesalahan. Coba lagi sebentar.");
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setCommentFormState("sending");
    setCommentFormMessage("");

    const formData = new FormData(form);
    const payload = {
      name: formData.get("comment-name"),
      whatsapp: formData.get("comment-whatsapp"),
      comment: formData.get("comment-text"),
      publishConsent: formData.get("publish-consent") === "on",
    };

    if (formData.get("share-location") === "on") {
      requestLocation();
    }

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readApiResponse(
        response,
        "Komentar belum berhasil dikirim.",
      );

      setComments((current) => [result.comment, ...current].slice(0, 50));
      setCommentsState("loaded");
      setCommentFormState("success");
      setCommentFormMessage("Terima kasih, komentarmu berhasil ditampilkan.");
      form.reset();
    } catch (error) {
      setCommentFormState("error");
      setCommentFormMessage(
        error.message || "Terjadi kesalahan. Coba lagi sebentar.",
      );
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="wordmark"
          href="#home"
          aria-label="Ilyas, ke beranda"
          onClick={closeMenu}
        >
          illyas<span>®</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Navigasi utama"
        >
          <a href="#tentang" onClick={closeMenu}>
            Tentang
          </a>
          <a href="#karya" onClick={closeMenu}>
            Karya
          </a>
          <a href="#kontak" onClick={closeMenu}>
            Kontak
          </a>
        </nav>
        <a className="availability" href="#kontak">
          <span className="availability-dot" />
          <span>Terbuka untuk kolaborasi</span>
          <ArrowUpRight size={14} />
        </a>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <motion.div
            className="hero-copy"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.p className="eyebrow" variants={reveal}>
              <span className="eyebrow-star">✳</span> HALO, SAYA ILYAS
            </motion.p>
            <motion.h1 variants={reveal}>
              Ide yang baik,
              <br />
              dibuat <span className="accent-text">jadi nyata.</span>
            </motion.h1>
            <motion.p className="hero-description" variants={reveal}>
              Saya seorang developer yang senang merancang dan membangun
              pengalaman digital yang terasa sederhana, berguna, dan berkesan.
            </motion.p>
            <motion.div className="hero-actions" variants={reveal}>
              <a className="button button-primary" href="#karya">
                Lihat karya <ArrowDownRight size={17} />
              </a>
              <a className="text-link" href="#tentang">
                Kenalan lebih dekat <ArrowRight size={15} />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-art"
            initial={{ opacity: 0, scale: 0.92, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-label="Ilustrasi abstrak berbentuk matahari"
            role="img"
          >
            <div className="art-grid" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-sun">
              <span />
            </div>
            <span className="art-caption">
              DESIGN
              <br />
              MEETS CODE
            </span>
            <span className="art-index">FIG. 001 — 2025</span>
            <span className="art-sparkle sparkle-one">✳</span>
            <span className="art-sparkle sparkle-two">✳</span>
          </motion.div>

          <a className="scroll-cue" href="#tentang">
            <span>SCROLL UNTUK MENJELAJAH</span>
            <ArrowDown size={14} />
          </a>
        </section>

        <section className="about section-wrap section-spacing" id="tentang">
          <SectionLabel number="01">SEDIKIT TENTANG SAYA</SectionLabel>
          <div className="about-grid">
            <motion.h2
              className="about-heading"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={reveal}
            >
              Membuat hal digital yang <span>terasa manusiawi.</span>
            </motion.h2>
            <motion.div
              className="about-copy"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={reveal}
            >
              <p>
                Buat saya, teknologi terbaik bukan yang paling rumit—melainkan
                yang membantu kehidupan sehari-hari terasa lebih mudah. Saya
                menikmati proses mengubah ide menjadi produk digital yang
                dipikirkan dengan baik, dari tampilan sampai cara kerjanya.
              </p>
              <p>
                Saat ini saya terus belajar, bereksperimen dengan teknologi web,
                dan terbuka untuk bertemu orang-orang yang ingin membuat sesuatu
                yang berdampak.
              </p>
              <a className="text-link" href="#kontak">
                Ceritakan idemu <ArrowRight size={15} />
              </a>
            </motion.div>
          </div>
          <div className="skills-row">
            <span className="skills-title">YANG SAYA GUNAKAN</span>
            <div className="skill-list">
              {skills.map((skill) => (
                <span className="skill-chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          className="reader-feedback section-wrap section-spacing"
          id="komentar"
        >
          <div className="reader-feedback-heading">
            <SectionLabel number="02">SUARA PEMBACA</SectionLabel>
            <p>Punya saran atau komentar? Saya senang mendengarnya.</p>
          </div>
          <div className="reader-feedback-grid">
            <form
              className="reader-comment-form"
              onSubmit={handleCommentSubmit}
            >
              <h2>
                Tinggalkan <span>pesan.</span>
              </h2>
              <label>
                Nama
                <input
                  name="comment-name"
                  type="text"
                  placeholder="Nama kamu"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                No. WhatsApp
                <input
                  name="comment-whatsapp"
                  type="tel"
                  placeholder="+62 812 3456 7890"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  maxLength={24}
                  pattern="\+?[0-9\s()-]{8,24}"
                  title="Masukkan nomor WhatsApp yang valid, termasuk kode negara."
                />
              </label>
              <label>
                Komentar / saran
                <textarea
                  name="comment-text"
                  rows="4"
                  placeholder="Tulis komentar atau saranmu..."
                  required
                  maxLength={1000}
                />
              </label>
              <label className="publish-consent">
                <input name="publish-consent" type="checkbox" required />
                <span>
                  Saya setuju nama dan komentar ini ditampilkan secara publik.
                </span>
              </label>
              <label className="publish-consent">
                <input name="share-location" type="checkbox" />
                <span>Jangan Tampilkan Nomor WhatssApp Saya.</span>
              </label>
              {locationMessage && (
                <p
                  className={`form-feedback location-feedback ${locationState}`}
                  aria-live="polite"
                >
                  {locationMessage}
                </p>
              )}
              <button
                className="button button-primary form-submit"
                type="submit"
                disabled={commentFormState === "sending"}
              >
                {commentFormState === "sending"
                  ? "Mengirim..."
                  : "Kirim komentar"}
                <ArrowUpRight size={17} />
              </button>
              <p
                className={`form-feedback ${commentFormState}`}
                aria-live="polite"
              >
                {commentFormMessage}
              </p>
            </form>

            <div className="reader-comments" aria-live="polite">
              <div className="reader-comments-heading">
                <h2>Kata mereka</h2>
                <span>{comments.length.toString().padStart(2, "0")}</span>
              </div>
              {commentsState === "loading" && (
                <p className="comments-empty">Memuat komentar...</p>
              )}
              {commentsState === "error" && (
                <p className="comments-empty">
                  Komentar belum bisa dimuat. Coba muat ulang halaman.
                </p>
              )}
              {commentsState === "loaded" && comments.length === 0 && (
                <p className="comments-empty">
                  Belum ada komentar. Jadilah yang pertama berbagi saran.
                </p>
              )}
              {commentsState === "loaded" && comments.length > 0 && (
                <div className="reader-comments-list">
                  {comments.map((comment) => (
                    <article className="reader-comment" key={comment.id}>
                      <span className="comment-quote" aria-hidden="true">
                        “
                      </span>
                      <p>{comment.comment}</p>
                      <div className="comment-author">
                        <span className="comment-avatar" aria-hidden="true">
                          {comment.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <h3>{comment.name}</h3>
                          <time dateTime={comment.created_at}>
                            {new Date(comment.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </time>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="work section-wrap section-spacing" id="karya">
          <div className="work-heading">
            <SectionLabel number="03">KARYA PILIHAN</SectionLabel>
            <p>Beberapa ide yang saya bawa dari konsep ke layar.</p>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <motion.article
                className="project-card"
                key={project.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={reveal}
              >
                <div className={`project-visual ${project.visual}`}>
                  <span className="project-mark">{project.mark}</span>
                  <span className="project-visual-note">
                    {project.number} / SELECTED WORK
                  </span>
                  <span className="project-orb" />
                </div>
                <div className="project-info">
                  <div className="project-meta">
                    <span>{project.type}</span>
                    <span>{project.number}</span>
                  </div>
                  <div className="project-title-row">
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                    <span className="project-arrow" aria-hidden="true">
                      <MoveUpRight size={20} />
                    </span>
                  </div>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <p className="projects-note">
            <span>✳</span> Proyek-proyek di atas adalah contoh yang bisa kamu
            sesuaikan dengan karyamu sendiri.
          </p>
        </section>

        <section className="contact section-wrap section-spacing" id="kontak">
          <SectionLabel number="04">PUNYA IDE MENARIK?</SectionLabel>
          <div className="contact-grid">
            <div className="contact-copy">
              <h2>
                Mari buat sesuatu yang <span>berarti.</span>
              </h2>
              <p>
                Ada proyek, pertanyaan, atau sekadar ingin menyapa? Kotak masuk
                saya selalu terbuka.
              </p>
              <a className="contact-email" href="mailto:halo@illyas.dev">
                halo@illyas.dev <ArrowUpRight size={17} />
              </a>
              <div className="social-links" aria-label="Media sosial">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <Github size={17} />
                </a>
                <a
                  href="https://linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={17} />
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                Nama
                <input
                  name="name"
                  type="text"
                  placeholder="Nama kamu"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
              <label>
                Pesan
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Ceritakan sedikit tentang idemu..."
                  required
                  maxLength={5000}
                />
              </label>
              <button
                className="button button-primary form-submit"
                type="submit"
                disabled={formState === "sending"}
              >
                {formState === "sending" ? "Mengirim..." : "Kirim pesan"}
                <ArrowUpRight size={17} />
              </button>
              <p className={`form-feedback ${formState}`} aria-live="polite">
                {formMessage}
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer section-wrap">
        <a className="wordmark" href="#home">
          illyas<span>®</span>
        </a>
        <p>
          Dibuat dengan rasa ingin tahu <span>✳</span> ©{" "}
          {new Date().getFullYear()} Ilyas
        </p>
        <a className="back-top" href="#home">
          Kembali ke atas <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}

export default App;
