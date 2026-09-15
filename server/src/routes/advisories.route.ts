import { Router } from 'express';

const router = Router();

// Curated + future: replace with cron-fetched live feed
const advisories = [
  { id: 1, title: 'Warning: Fake Package Delivery Scams', description: 'Scams claiming you have a package waiting, asking you to click a link or provide payment details.', category: 'phishing', severity: 'high', link: 'https://www.ftc.gov/news-events/blogs/news/2024/08/fake-package-delivery-scams-on-the-rise' },
  { id: 2, title: 'Warning: QR Code Scams', description: 'Malicious QR codes in public places leading to fake payment pages or malware downloads.', category: 'malware', severity: 'high', link: 'https://www.consumer.ftc.gov/articles/2024/09/qr-code-scams-increasing' },
  { id: 3, title: 'Warning: Investment Scams', description: 'Unsolicited messages promising guaranteed returns, crypto opportunities, or get-rich-quick schemes.', category: 'scam', severity: 'medium', link: 'https://www.ic3.gov/2024-ic3-report' },
  { id: 4, title: 'Warning: Phishing Email Trends', description: 'Emails impersonating HR/payroll requesting gift card purchases. Verify via official channel.', category: 'phishing', severity: 'medium', link: 'https://www.sophos.com/en-us/mediacenter/articles/2024/phishing-trends' },
  { id: 5, title: 'Warning: Tech Support Scams', description: 'Unsolicited calls claiming your computer has a virus, asking for remote access or payment.', category: 'scam', severity: 'high', link: 'https://www.ftc.gov/news-events/blogs/news/2024/03/tech-support-scams' },
];

router.get('/scam-advisories', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({ advisories });
});

export default router;
