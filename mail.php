<?php
declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(0);
date_default_timezone_set('Asia/Kolkata');

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    $originHost = strtolower(parse_url($origin, PHP_URL_HOST) ?? '');
    $serverHost = strtolower($_SERVER['HTTP_HOST'] ?? '');
    if ($originHost === $serverHost || in_array($originHost, ['localhost', '127.0.0.1', '::1', 'www.walprojects.com', 'walprojects.com'], true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
        header('Vary: Origin');
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $input = $decoded;
        }
    }
}
if (empty($input) && !empty($_POST)) {
    $input = $_POST;
}

$name = trim((string)($input['name'] ?? ''));
$phoneRaw = trim((string)($input['phone'] ?? $input['mobile'] ?? $input['phone_number'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$project = trim((string)($input['project'] ?? 'WAL Projects Gurgaon'));
$source = trim((string)($input['source'] ?? 'website'));
$pageUrl = trim((string)($input['page_url'] ?? $_SERVER['HTTP_REFERER'] ?? ''));
$utmSource = trim((string)($input['utm_source'] ?? ''));
$utmMedium = trim((string)($input['utm_medium'] ?? ''));
$utmCampaign = trim((string)($input['utm_campaign'] ?? ''));

$errors = [];

$restrictedWords = [
    // Adult / Sexual
    "porn", "porno", "xxx", "sex", "sexy", "sexual",
    "nude", "nudes", "naked", "nsfw", "erotic",
    "boobs", "boob", "tits", "titty", "milf",
    "hentai", "blowjob", "handjob", "orgasm",
    "masturbation", "masturbate", "cum", "semen",
    "sperm", "vagina", "penis", "pussy", "dildo",
    "prostitute", "prostitution", "escort", "hooker",
    "fuck", "fucking", "fucked", "fucker",
    "motherfucker", "dick", "dickhead", "cock",
    "cocksucker", "asshole", "bastard", "bitch",
    "whore", "slut", "rape", "rapist",

    // Additional English Bad Words
    "bullshitter", "bullshitting", "shithead",
    "shitface", "dipshit", "jackass", "dumbfuck",
    "fuckface", "fuckhead", "fucker", "fuckedup",
    "motherfucking", "clusterfuck", "shitbag",
    "scumbag", "dickwad", "dickweed", "twat",
    "tosser", "bellend", "wanker", "knobhead",
    "pisshead", "arsehole", "arsewipe",
    "douche", "douchebag", "dumbass",
    "asswipe", "asshat", "shitstorm",
    "crap", "crappy", "horseshit",
    "sonofabitch", "sonofawhore",
    "skank", "tramp", "freak", "pervert",
    "perverted", "sleazebag", "degenerate",
    "sucker", "loser", "scumbag",

    // Body Part Slang
    "breasts", "nipples", "testicles",
    "balls", "scrotum", "anus", "butthole",
    "buttock", "ass", "arse", "cockhead",
    "boobs", "dick", "penis", "vagina",

    // Abusive / Offensive
    "idiot", "moron", "retard", "imbecile",
    "stupid", "stupidity", "dumbass",
    "fool", "jackass", "bastard",
    "bitchy", "bitching", "dammit",
    "damn", "hell", "pissed", "prick",
    "jerk", "jerkoff", "pig", "coward",
    "worthless", "pathetic",

    // Indian / Hinglish Abusive Words
    "chutiya", "chutiye", "madarchod",
    "behenchod", "bhenchod", "bhosdike",
    "bhosdi", "gaand", "gandu", "gand",
    "lund", "lauda", "loda", "lavde",
    "lawde", "chodu", "chod", "randi",
    "randwa", "harami", "haraami",
    "kamina", "kamine", "suar", "kutte",
    "kutti", "saala", "saali",

    // Fake / Spam Names
    "test", "testing", "tester", "dummy",
    "asdf", "qwerty", "qwert", "unknown",
    "anonymous", "guest", "demo", "sample",
    "fake", "fakeuser", "temp", "temporary",
    "null", "undefined", "admin", "administrator",
    "hello", "hii", "hiii", "none", "no name",
    "yourname", "firstname", "lastname",

    // Random / Placeholder Values
    "abc", "abcd", "abcdef", "xyz",
    "aaaa", "bbbb", "xxxx", "zzzz",
    "123", "1234", "12345", "0000",
    "notavailable", "notapplicable",
    "na", "n/a", "nil", "nothing"
];

function hasRestrictedWord($text, $restrictedWords) {
    if (!$text) return false;
    $lower = mb_strtolower(trim($text), 'UTF-8');
    $cleanLower = preg_replace('/[^a-z0-9\s]/u', ' ', $lower);
    $words = array_filter(preg_split('/\s+/u', $cleanLower));

    foreach ($restrictedWords as $rw) {
        $rwLower = mb_strtolower($rw, 'UTF-8');
        if (in_array($rwLower, $words, true) || $lower === $rwLower) {
            return true;
        }
        if (strpos($rwLower, ' ') !== false || strpos($rwLower, '/') !== false) {
            if (strpos($lower, $rwLower) !== false) {
                return true;
            }
        }
        if (strlen($rwLower) >= 4 && strpos($cleanLower, $rwLower) !== false) {
            return true;
        }
    }
    return false;
}

if ($name === '') {
    $errors['name'] = 'Full name is required.';
} elseif (mb_strlen($name) < 2 || mb_strlen($name) > 60) {
    $errors['name'] = 'Full name must be between 2 and 60 characters.';
} elseif (preg_match('/^\d+$/', $name)) {
    $errors['name'] = 'Name cannot be purely numeric.';
} elseif (!preg_match('/^[\p{Script=Latin}\p{Script=Devanagari}]+(?:[ \'\x{2019}-][\p{Script=Latin}\p{Script=Devanagari}]+)*$/u', $name)) {
    $errors['name'] = 'Please enter a valid name using letters.';
} elseif (hasRestrictedWord($name, $restrictedWords)) {
    $errors['name'] = 'Please enter a valid, authentic name.';
}

$cleanPhone = preg_replace('/\D/', '', $phoneRaw);
if (strlen($cleanPhone) === 12 && substr($cleanPhone, 0, 2) === '91') {
    $cleanPhone = substr($cleanPhone, 2);
}
if ($cleanPhone === '') {
    $errors['phone'] = 'Mobile number is required.';
} elseif (!preg_match('/^[6-9]\d{9}$/', $cleanPhone)) {
    $errors['phone'] = 'Please enter a valid 10-digit Indian mobile number.';
}

if ($email !== '') {
    if (mb_strlen($email) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) {
        $errors['email'] = 'Please enter a valid email address.';
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please correct the highlighted fields.',
        'errors' => $errors
    ]);
    exit;
}

$visitorIp = 'Unknown';
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $visitorIp = trim($ips[0]);
} elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $visitorIp = trim($_SERVER['HTTP_CLIENT_IP']);
} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
    $visitorIp = trim($_SERVER['REMOTE_ADDR']);
}

$leadRecord = [
    'id' => uniqid('lead_', true),
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => $name,
    'phone' => $cleanPhone,
    'email' => $email,
    'project' => $project,
    'source' => $source,
    'page_url' => $pageUrl,
    'utm_source' => $utmSource,
    'utm_medium' => $utmMedium,
    'utm_campaign' => $utmCampaign,
    'ip' => $visitorIp,
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
];

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$jsonFile = $dataDir . '/leads.json';
$existingLeads = [];
if (file_exists($jsonFile)) {
    $jsonContent = file_get_contents($jsonFile);
    if (!empty($jsonContent)) {
        $decodedLeads = json_decode($jsonContent, true);
        if (is_array($decodedLeads)) {
            $existingLeads = $decodedLeads;
        }
    }
}
$existingLeads[] = $leadRecord;
file_put_contents($jsonFile, json_encode($existingLeads, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);

$csvFile = $dataDir . '/leads.csv';
$isNewCsv = !file_exists($csvFile);
$csvHandle = fopen($csvFile, 'a');
if ($csvHandle !== false) {
    if ($isNewCsv) {
        fputcsv($csvHandle, ['ID', 'Date Time', 'Name', 'Phone', 'Email', 'Project', 'Source', 'Page URL', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'IP', 'User Agent']);
    }
    $safeName = preg_replace('/^[=+\-@]/', "'$0", $name);
    fputcsv($csvHandle, [
        $leadRecord['id'],
        $leadRecord['timestamp'],
        $safeName,
        $cleanPhone,
        $email,
        $project,
        $source,
        $pageUrl,
        $utmSource,
        $utmMedium,
        $utmCampaign,
        $visitorIp,
        $leadRecord['user_agent']
    ]);
    fclose($csvHandle);
}

$webhookUrl = getenv('CRM_WEBHOOK_URL');
if (!empty($webhookUrl)) {
    $ch = curl_init($webhookUrl);
    if ($ch !== false) {
        $payload = json_encode($leadRecord);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Content-Length: ' . strlen($payload)]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_exec($ch);
        curl_close($ch);
    }
}

$notificationEmail = getenv('LEAD_NOTIFICATION_EMAIL') ?: 'info@walprojects.com';
if (!empty($notificationEmail) && filter_var($notificationEmail, FILTER_VALIDATE_EMAIL)) {
    $subject = 'New Enquiry for ' . $project . ' - ' . $name;
    $body = "New lead received:\n\n" .
            "Name: " . $name . "\n" .
            "Phone: +91 " . $cleanPhone . "\n" .
            "Email: " . ($email !== '' ? $email : 'N/A') . "\n" .
            "Project: " . $project . "\n" .
            "Time: " . $leadRecord['timestamp'] . "\n" .
            "Source: " . $source . "\n" .
            "Page: " . $pageUrl . "\n";
    $headers = 'From: noreply@walprojects.com' . "\r\n" .
               'Reply-To: ' . ($email !== '' ? $email : 'noreply@walprojects.com') . "\r\n" .
               'X-Mailer: PHP/' . phpversion();
    mail($notificationEmail, $subject, $body, $headers);
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Thank you for your enquiry. Our property specialists will contact you shortly.',
    'lead_id' => $leadRecord['id']
]);
