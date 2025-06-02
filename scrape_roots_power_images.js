const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Create directories for organizing images
const createDirectories = () => {
  const dirs = [
    "roots_power_images",
    "roots_power_images/home_page",
    "roots_power_images/projects",
    "roots_power_images/logo",
    "roots_power_images/other",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Download image from URL
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(filepath);
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
  });
};

// Get file extension from URL
const getExtension = (url) => {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname);
  return ext || ".jpg"; // Default to .jpg if no extension
};

const scrapeImages = async () => {
  console.log("Starting Roots Power image scraping...");

  // Create directory structure
  createDirectories();

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();

  // Set user agent to avoid detection
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const pages = [
    { url: "https://www.rootspower.com/", name: "home", category: "home_page" },
    {
      url: "https://www.rootspower.com/services-1",
      name: "services",
      category: "other",
    },
    {
      url: "https://www.rootspower.com/s-projects-side-by-side",
      name: "projects",
      category: "projects",
    },
    {
      url: "https://www.rootspower.com/about-4",
      name: "about",
      category: "other",
    },
    {
      url: "https://www.rootspower.com/contact-1",
      name: "contact",
      category: "other",
    },
  ];

  const downloadedImages = [];

  for (const pageInfo of pages) {
    console.log(`\nScraping ${pageInfo.name} page: ${pageInfo.url}`);

    try {
      await page.goto(pageInfo.url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for images to load
      await page.waitForTimeout(3000);

      // Get all images on the page
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        return imgs
          .map((img) => ({
            src: img.src,
            alt: img.alt || "",
            title: img.title || "",
            className: img.className || "",
            width: img.naturalWidth,
            height: img.naturalHeight,
          }))
          .filter(
            (img) =>
              img.src &&
              !img.src.includes("data:") &&
              img.width > 50 &&
              img.height > 50
          );
      });

      console.log(`Found ${images.length} images on ${pageInfo.name} page`);

      // Download each image
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        console.log(`  Downloading image ${i + 1}: ${img.src}`);

        try {
          const extension = getExtension(img.src);
          let filename;
          let category = pageInfo.category;

          // Determine filename and category based on known images
          if (img.src.includes("IMG_4068") || img.alt.includes("IMG_4068")) {
            filename = `IMG_4068${extension}`;
            category = "home_page";
          } else if (
            img.src.includes("IMG_0966") ||
            img.alt.includes("IMG_0966")
          ) {
            filename = `IMG_0966${extension}`;
            category = "home_page";
          } else if (
            img.src.includes("IMG_0042") ||
            img.alt.includes("IMG_0042")
          ) {
            filename = `IMG_0042${extension}`;
            category = "home_page";
          } else if (
            img.src.includes("coast.jpg") ||
            img.alt.includes("coast")
          ) {
            if (img.src.includes("coast2")) {
              filename = `coast2.jpg`;
            } else {
              filename = `coast.jpg`;
            }
            category = "projects";
          } else if (img.src.includes("tree.jpg") || img.alt.includes("tree")) {
            filename = `tree.jpg`;
            category = "projects";
          } else if (
            img.src.includes("RootsPowerColorStacked") ||
            img.src.includes("logo") ||
            img.alt.toLowerCase().includes("logo")
          ) {
            filename = `RootsPowerColorStacked_BLK_SM${extension}`;
            category = "logo";
          } else {
            // Generate filename for other images
            const urlParts = img.src.split("/");
            const originalName = urlParts[urlParts.length - 1].split("?")[0];
            filename = `${pageInfo.name}_${i + 1}_${originalName}${extension}`;
          }

          const filepath = path.join("roots_power_images", category, filename);

          await downloadImage(img.src, filepath);

          downloadedImages.push({
            originalUrl: img.src,
            filename: filename,
            category: category,
            page: pageInfo.name,
            alt: img.alt,
            title: img.title,
            dimensions: `${img.width}x${img.height}`,
            filepath: filepath,
          });

          console.log(`    ✓ Saved as: ${filepath}`);
        } catch (err) {
          console.log(`    ✗ Failed to download: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`Error scraping ${pageInfo.name} page: ${err.message}`);
    }
  }

  await browser.close();

  // Create image inventory file
  const inventory = {
    timestamp: new Date().toISOString(),
    total_images: downloadedImages.length,
    images_by_category: {
      home_page: downloadedImages.filter((img) => img.category === "home_page"),
      projects: downloadedImages.filter((img) => img.category === "projects"),
      logo: downloadedImages.filter((img) => img.category === "logo"),
      other: downloadedImages.filter((img) => img.category === "other"),
    },
    all_images: downloadedImages,
  };

  fs.writeFileSync(
    "roots_power_images/image_inventory.json",
    JSON.stringify(inventory, null, 2)
  );

  console.log("\n=== SCRAPING COMPLETE ===");
  console.log(`Total images downloaded: ${downloadedImages.length}`);
  console.log(
    `Home page images: ${inventory.images_by_category.home_page.length}`
  );
  console.log(
    `Project images: ${inventory.images_by_category.projects.length}`
  );
  console.log(`Logo images: ${inventory.images_by_category.logo.length}`);
  console.log(`Other images: ${inventory.images_by_category.other.length}`);
  console.log(
    "\nImage inventory saved to: roots_power_images/image_inventory.json"
  );
  console.log("Images organized in directories: roots_power_images/");

  return inventory;
};

// Run the scraper
scrapeImages().catch(console.error);
