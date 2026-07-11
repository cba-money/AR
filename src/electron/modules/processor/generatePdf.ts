import puppeteer from 'puppeteer';

/**
 * Generates a PDF locally using standard Puppeteer
 */
export async function generatePdfLocally(html: string, outputPdfPath: string): Promise<void> {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "load" });

        await page.pdf({
            path: outputPdfPath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                right: "20px",
                bottom: "20px",
                left: "20px"
            }
        });
    } finally {
        await browser.close();
    }
}