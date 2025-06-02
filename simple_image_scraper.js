const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

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
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(filepath);
        });
        file.on("error", reject);
      })
      .on("error", reject);
  });
};

// Fetch HTML content from URL
const fetchHTML = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
};

// Extract image URLs from HTML
const extractImageUrls = (html, baseUrl) => {
  const imageRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const images = [];
  let match;

  while ((match = imageRegex.exec(html)) !== null) {
    let src = match[1];

    // Convert relative URLs to absolute
    if (src.startsWith("/")) {
      src = new URL(src, baseUrl).href;
    } else if (src.startsWith("//")) {
      src = "https:" + src;
    } else if (!src.startsWith("http")) {
      src = new URL(src, baseUrl).href;
    }

    // Extract alt text
    const altMatch = match[0].match(/alt\s*=\s*["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";

    images.push({ src, alt, original: match[0] });
  }

  return images;
};

// Get file extension from URL
const getExtension = (url) => {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext || ".jpg";
  } catch {
    return ".jpg";
  }
};

const scrapeImages = async () => {
  console.log("Starting Roots Power image scraping...");

  createDirectories();

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
      const html = await fetchHTML(pageInfo.url);
      const images = extractImageUrls(html, pageInfo.url);

      console.log(`Found ${images.length} images on ${pageInfo.name} page`);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        // Skip tiny images, data URLs, and common web elements
        if (
          img.src.includes("data:") ||
          img.src.includes("googletagmanager") ||
          img.src.includes("analytics") ||
          img.src.includes("facebook") ||
          img.src.includes("twitter") ||
          img.src.includes("favicon")
        ) {
          continue;
        }

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
          } else if (img.src.includes("coast") && img.src.includes("2")) {
            filename = `coast2.jpg`;
            category = "projects";
          } else if (img.src.includes("coast")) {
            filename = `coast.jpg`;
            category = "projects";
          } else if (img.src.includes("tree")) {
            filename = `tree.jpg`;
            category = "projects";
          } else if (
            img.src.includes("RootsPower") ||
            img.src.includes("logo") ||
            img.alt.toLowerCase().includes("logo")
          ) {
            filename = `RootsPowerColorStacked_BLK_SM${extension}`;
            category = "logo";
          } else {
            // Generate filename for other images
            const urlParts = img.src.split("/");
            let originalName = urlParts[urlParts.length - 1].split("?")[0];
            if (!originalName || originalName.length < 3) {
              originalName = `image_${i + 1}`;
            }
            filename = `${pageInfo.name}_${originalName}`;
            if (!filename.includes(".")) {
              filename += extension;
            }
          }

          const filepath = path.join("roots_power_images", category, filename);

          await downloadImage(img.src, filepath);

          downloadedImages.push({
            originalUrl: img.src,
            filename: filename,
            category: category,
            page: pageInfo.name,
            alt: img.alt,
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
