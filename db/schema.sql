-- Squaberry database schema. Applied by `npm run db:migrate`; every statement is safe to re-run.

CREATE TABLE IF NOT EXISTS enquiries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  company VARCHAR(120) NULL,
  topic VARCHAR(60) NULL,
  message TEXT NOT NULL,
  source_page VARCHAR(120) NULL,
  product VARCHAR(60) NULL,
  phone VARCHAR(40) NULL,
  status ENUM('new', 'read', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_enquiries_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  service_slug VARCHAR(60) NOT NULL,
  title VARCHAR(120) NOT NULL,
  client VARCHAR(120) NULL,
  summary VARCHAR(400) NULL,
  site_url VARCHAR(500) NULL,
  image_url VARCHAR(500) NULL,
  slug VARCHAR(140) NULL,
  intro VARCHAR(600) NULL,
  scope VARCHAR(600) NULL,
  overview TEXT NULL,
  challenge TEXT NULL,
  solution TEXT NULL,
  results TEXT NULL,
  gallery TEXT NULL,
  quote TEXT NULL,
  quote_name VARCHAR(120) NULL,
  quote_role VARCHAR(120) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_portfolio_slug (slug),
  KEY idx_portfolio_service (service_slug, published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- "Am I a Muslim?" quiz (public/oneness.html, served by app/api/oneness/route.ts).
-- One running total row (id = 1), per-question counts, and people who asked to be contacted.
CREATE TABLE IF NOT EXISTS oneness_stats (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  tried INT UNSIGNED NOT NULL DEFAULT 0,
  passed INT UNSIGNED NOT NULL DEFAULT 0,
  failed INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oneness_reasons (
  question_id VARCHAR(40) NOT NULL PRIMARY KEY,
  failed INT UNSIGNED NOT NULL DEFAULT 0,
  unsure INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oneness_leads (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  contact VARCHAR(120) NOT NULL,
  result ENUM('failed', 'unsure', 'passed') NOT NULL,
  failed_ids VARCHAR(1000) NOT NULL DEFAULT '',
  unsure_ids VARCHAR(1000) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_oneness_leads_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
