/**
 * CleanMark API Server
 * High-performance Web-to-Markdown and Data Extraction Microservice
 * Zero external npm dependencies - uses native Node.js HTTP and DNS modules.
 */

const http = require('http');
const dns = require('dns').promises;
const url = require('url');

const PORT = process.env.PORT || 3000;

// Top common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'throwawaymail.com', 'yopmail.com', 'trashmail.com',
  'getairmail.com', 'dispostable.com', 'temp-mail.org', 'fakeinbox.com',
  'mohmal.com', 'crazymailing.com', 'nada.ltd', 'emailondeck.com',
  'burnermail.io', 'inboxkitten.com', 'mytemp.email', 'tempail.com'
]);

const FREE_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'zoho.com'
]);

function htmlToMarkdown(html) {
  let text = html;

  // Remove scripts, styles, svg, and comments
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Remove header, nav, footer, aside
  text = text.replace(/<(header|nav|footer|aside)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // Convert headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');

  // Convert paragraphs and linebreaks
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  text = text.replace(/<br\s*[\/]?>/gi, '\n');

  // Convert links
  text = text.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Convert lists
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n* $1');

  // Convert bold and italic
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");

  // Clean excess whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return { title, markdown: text };
}

function extractMetadata(html, targetUrl) {
  const getTag = (pattern) => {
    const match = html.match(pattern);
    return match ? match[1].trim() : null;
  };

  const title = getTag(/<title[^>]*>([^<]+)<\/title>/i) || getTag(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const description = getTag(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || getTag(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  const ogImage = getTag(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const siteName = getTag(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
  
  let favicon = getTag(/<link\s+[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
  if (favicon && !favicon.startsWith('http')) {
    const parsed = new URL(targetUrl);
    favicon = new URL(favicon, parsed.origin).href;
  }

  return {
    success: true,
    url: targetUrl,
    title,
    description,
    og_image: ogImage,
    favicon: favicon || `${new URL(targetUrl).origin}/favicon.ico`,
    site_name: siteName
  };
}

async function handleExtract(body) {
  const targetUrl = body.url;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    throw { status: 400, message: 'Parâmetro "url" é obrigatório e deve iniciar com http:// ou https://' };
  }

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'CleanMark-Bot/1.0 (+https://rapidapi.com)'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) {
    throw { status: 502, message: `Falha ao acessar URL de destino (HTTP ${res.status})` };
  }

  const html = await res.text();
  const { title, markdown } = htmlToMarkdown(html);

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const estimatedTokens = Math.ceil(wordCount * 1.33);

  return {
    success: true,
    url: targetUrl,
    title,
    markdown,
    metrics: {
      word_count: wordCount,
      reading_time_minutes: readingTime,
      estimated_tokens: estimatedTokens
    }
  };
}

async function handleValidateEmail(body) {
  const email = (body.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return {
      email,
      is_valid_format: false,
      is_disposable: false,
      is_free_provider: false,
      domain: '',
      mx_found: false
    };
  }

  const domain = email.split('@')[1];
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isFreeProvider = FREE_PROVIDERS.has(domain);

  let mxFound = false;
  try {
    const mx = await dns.resolveMx(domain);
    mxFound = mx && mx.length > 0;
  } catch (_) {
    mxFound = false;
  }

  return {
    email,
    is_valid_format: true,
    is_disposable: isDisposable,
    is_free_provider: isFreeProvider,
    domain,
    mx_found: mxFound
  };
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && (pathname === '/v1/health' || pathname === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'CleanMark AI Web to Markdown API',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime())
    }));
    return;
  }

  if (req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        const body = bodyData ? JSON.parse(bodyData) : {};
        let result;

        if (pathname === '/v1/extract') {
          result = await handleExtract(body);
        } else if (pathname === '/v1/metadata') {
          const resMeta = await fetch(body.url, { headers: { 'User-Agent': 'CleanMark-Bot/1.0' } });
          const html = await resMeta.text();
          result = extractMetadata(html, body.url);
        } else if (pathname === '/v1/validate-email') {
          result = await handleValidateEmail(body);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result, null, 2));
      } catch (err) {
        const statusCode = err.status || 500;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message || 'Erro interno de processamento'
        }));
      }
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Método não permitido' }));
});

server.listen(PORT, () => {
  console.log(`[CleanMark API] Servidor rodando na porta ${PORT}`);
});
