<?php
declare(strict_types=1);

/*
 * Contact form handler for contact.html.
 *
 * Validates the enquiry and sends it as a plain-text email over authenticated SMTP.
 * SMTP settings come from an INI file kept OUTSIDE the web root. Its path is read from the
 * SQUABERRY_MAIL_CONFIG environment/FastCGI parameter, falling back to ../squaberry-mail.ini.
 * See deploy/mail.ini.example and deploy/nginx-ploi.conf.
 *
 * Responds with JSON when the request asks for it (the progressive-enhancement fetch in script.js),
 * otherwise redirects back to contact.html with ?sent=1 or ?error=<code>.
 */

const TOPICS = [
    'Web & app development',
    'Design & digital experiences',
    'Cloud & infrastructure',
    'AI & workflow automation',
    'IT support & security',
    'Strategy & consulting',
    'Something else',
];
const RATE_LIMIT = 5;          // submissions allowed per IP...
const RATE_WINDOW = 3600;      // ...within this many seconds
const MIN_FILL_SECONDS = 3;    // faster than this is treated as a bot

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, int $status, string $code, string $message, array $errors = []): never
{
    global $wantsJson;
    http_response_code($status);
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => (object) $errors], JSON_UNESCAPED_UNICODE);
    } else {
        $query = $ok ? 'sent=1' : 'error=' . rawurlencode($code);
        header('Location: contact.html?' . $query . '#enquiry', true, 303);
    }
    exit;
}

function clean_text(string $value): string
{
    // Replace any invalid UTF-8 rather than letting the /u regexes below fail and blank the field.
    return mb_check_encoding($value, 'UTF-8') ? $value : mb_scrub($value, 'UTF-8');
}

function clean_line(string $value, int $max): string
{
    // Collapsing all whitespace (including CR/LF) also stops header injection via name or email.
    $value = trim(preg_replace('/\s+/u', ' ', clean_text($value)) ?? '');
    return mb_substr($value, 0, $max);
}

function load_config(): array
{
    $path = getenv('SQUABERRY_MAIL_CONFIG') ?: ($_SERVER['SQUABERRY_MAIL_CONFIG'] ?? '');
    if ($path === '') {
        $path = dirname(__DIR__) . '/squaberry-mail.ini';
    }
    $ini = is_readable($path) ? parse_ini_file($path, false, INI_SCANNER_RAW) : false;
    if (!is_array($ini)) {
        error_log('contact-submit: mail config not readable at ' . $path);
        return [];
    }
    // INI_SCANNER_RAW keeps punctuation in passwords intact; strip optional wrapping quotes.
    $ini = array_map(static fn($v) => preg_replace('/^"(.*)"$/s', '$1', trim((string) $v)), $ini);
    foreach (['host', 'port', 'to'] as $required) {
        if (($ini[$required] ?? '') === '') {
            error_log("contact-submit: mail config is missing '$required'");
            return [];
        }
    }
    $ini['secure'] = strtolower($ini['secure'] ?? 'ssl');
    $ini['from'] = ($ini['from'] ?? '') !== '' ? $ini['from'] : ($ini['username'] ?? '');
    $ini['from_name'] = ($ini['from_name'] ?? '') !== '' ? $ini['from_name'] : 'Squaberry website';
    return $ini;
}

function rate_limited(string $ip): bool
{
    $now = time();
    // Forget every visitor whose last submission is older than the window (the privacy policy relies on this).
    foreach (glob(sys_get_temp_dir() . '/squaberry-form-*') ?: [] as $old) {
        if (@filemtime($old) < $now - RATE_WINDOW) {
            @unlink($old);
        }
    }
    $file = sys_get_temp_dir() . '/squaberry-form-' . hash('sha256', $ip . '|squaberry');
    $handle = @fopen($file, 'c+');
    if (!$handle) {
        return false; // fail open rather than block real enquiries
    }
    flock($handle, LOCK_EX);
    $stamps = array_filter(
        array_map('intval', explode(',', (string) stream_get_contents($handle))),
        static fn(int $t) => $t > $now - RATE_WINDOW
    );
    $limited = count($stamps) >= RATE_LIMIT;
    if (!$limited) {
        $stamps[] = $now;
    }
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, implode(',', $stamps));
    flock($handle, LOCK_UN);
    fclose($handle);
    return $limited;
}

function encode_header(string $text): string
{
    return preg_match('/[^\x20-\x7E]/', $text) ? '=?UTF-8?B?' . base64_encode($text) . '?=' : $text;
}

function encode_display_name(string $name): string
{
    if (preg_match('/[^\x20-\x7E]/', $name)) {
        return encode_header($name);
    }
    return '"' . addcslashes($name, '"\\') . '"';
}

final class SmtpException extends RuntimeException {}

function smtp_send(array $cfg, string $from, string $to, string $data): void
{
    $secure = $cfg['secure'];
    $transport = $secure === 'ssl' ? 'ssl' : 'tcp';
    $context = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'peer_name' => $cfg['host']]]);
    $socket = @stream_socket_client("$transport://{$cfg['host']}:{$cfg['port']}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        throw new SmtpException("connect failed: $errstr ($errno)");
    }
    stream_set_timeout($socket, 15);

    $read = static function () use ($socket): array {
        $lines = '';
        while (($line = fgets($socket, 1024)) !== false) {
            $lines .= $line;
            if (strlen($line) < 4 || $line[3] !== '-') {
                break;
            }
        }
        return [(int) substr($lines, 0, 3), trim($lines)];
    };
    // $label names the step in error logs, so credentials and message content never reach the log.
    $command = static function (string $label, ?string $line, int ...$expect) use ($socket, $read): string {
        if ($line !== null) {
            fwrite($socket, $line . "\r\n");
        }
        [$code, $reply] = $read();
        if (!in_array($code, $expect, true)) {
            throw new SmtpException("unexpected reply to $label: $reply");
        }
        return $reply;
    };

    $helo = preg_replace('/[^A-Za-z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? '') ?: 'localhost';
    try {
        $command('greeting', null, 220);
        $command('EHLO', "EHLO $helo", 250);
        if ($secure === 'tls') {
            $command('STARTTLS', 'STARTTLS', 220);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                throw new SmtpException('STARTTLS negotiation failed');
            }
            $command('EHLO after STARTTLS', "EHLO $helo", 250);
        }
        if (($cfg['username'] ?? '') !== '') {
            $command('AUTH LOGIN', 'AUTH LOGIN', 334);
            $command('AUTH username', base64_encode($cfg['username']), 334);
            $command('AUTH password', base64_encode($cfg['password'] ?? ''), 235);
        }
        $command('MAIL FROM', "MAIL FROM:<$from>", 250);
        $command('RCPT TO', "RCPT TO:<$to>", 250, 251);
        $command('DATA', 'DATA', 354);
        // Dot-stuff any line starting with "." (headers only; the body is base64).
        $command('message body', preg_replace('/^\./m', '..', $data) . "\r\n.", 250);
        $command('QUIT', 'QUIT', 221);
    } finally {
        fclose($socket);
    }
}

// --- Request checks -------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 405, 'method', 'Please use the form on the contact page.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) {
    respond(false, 403, 'origin', 'This form can only be sent from squaberry.co.uk.');
}

// Bots: a filled honeypot or an impossibly fast submission gets a quiet "success" and no email.
$started = (int) ($_POST['started'] ?? 0);
if (trim((string) ($_POST['website'] ?? '')) !== '' || ($started > 0 && time() - $started < MIN_FILL_SECONDS)) {
    respond(true, 200, 'ok', 'Thanks — your message is on its way. We’ll reply by email.');
}

// --- Validation -----------------------------------------------------------------------------

$name = clean_line((string) ($_POST['name'] ?? ''), 120);
$email = clean_line((string) ($_POST['email'] ?? ''), 254);
$company = clean_line((string) ($_POST['company'] ?? ''), 120);
$topic = clean_line((string) ($_POST['topic'] ?? ''), 60);
$message = trim(str_replace("\r\n", "\n", clean_text((string) ($_POST['message'] ?? ''))));

$errors = [];
if ($name === '') {
    $errors['name'] = 'Please tell us your name.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if ($topic !== '' && !in_array($topic, TOPICS, true)) {
    $errors['topic'] = 'Please choose a topic from the list.';
}
if (mb_strlen($message) < 10) {
    $errors['message'] = 'Please add a little more detail to your message.';
} elseif (mb_strlen($message) > 5000) {
    $errors['message'] = 'Please keep your message under 5,000 characters.';
}
if ($errors) {
    respond(false, 422, 'invalid', 'Please check the highlighted fields and try again.', $errors);
}

if (rate_limited($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
    respond(false, 429, 'busy', 'You’ve sent several messages in a short time. Please try again later or email hello@squaberry.co.uk.');
}

$config = load_config();
if (!$config) {
    respond(false, 503, 'unavailable', 'The form isn’t available right now. Please email hello@squaberry.co.uk instead.');
}

// --- Compose and send -----------------------------------------------------------------------

$body = "New enquiry from the squaberry.co.uk contact form\n\n"
    . "Name:    $name\n"
    . "Email:   $email\n"
    . 'Company: ' . ($company !== '' ? $company : '—') . "\n"
    . 'Topic:   ' . ($topic !== '' ? $topic : '—') . "\n\n"
    . "Message:\n$message\n\n"
    . '— Sent ' . gmdate('j F Y, H:i') . " UTC. Reply to this email to answer the sender directly.\n";

$fromDomain = substr(strrchr($config['from'], '@') ?: '@localhost', 1);
$headers = [
    'Date: ' . date(DATE_RFC2822),
    'From: ' . encode_display_name($config['from_name']) . ' <' . $config['from'] . '>',
    'To: <' . $config['to'] . '>',
    'Reply-To: ' . encode_display_name($name) . " <$email>",
    'Subject: ' . encode_header('Website enquiry from ' . $name),
    'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $fromDomain . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'X-Mailer: squaberry-contact-form',
];
$data = implode("\r\n", $headers) . "\r\n\r\n" . rtrim(chunk_split(base64_encode(str_replace("\n", "\r\n", $body)), 76, "\r\n"));

try {
    smtp_send($config, $config['from'], $config['to'], $data);
} catch (SmtpException $e) {
    error_log('contact-submit: SMTP send failed: ' . $e->getMessage());
    respond(false, 502, 'send', 'Sorry, your message couldn’t be sent. Please try again or email hello@squaberry.co.uk.');
}

respond(true, 200, 'ok', 'Thanks — your message is on its way. We’ll reply by email.');
