const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Create directories for organizing images
const createDirectories = () => {
  const dirs = [
    "roots_power_images_hq",
    "roots_power_images_hq/home_page",
    "roots_power_images_hq/projects",
    "roots_power_images_hq/logo",
    "roots_power_images_hq/other",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Download image from URL with retry mechanism
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol
      .get(url, (response) => {
        // Handle redirects
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlinkSync(filepath);
          return downloadImage(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(filepath);
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(filepath);
        });
        file.on("error", (err) => {
          fs.unlinkSync(filepath);
          reject(err);
        });
      })
      .on("error", (err) => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(err);
      });
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

// Extract high-quality image URLs from HTML
const extractHighQualityImageUrls = (html, baseUrl) => {
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

    // Convert to high-quality URL by removing optimization parameters
    const highQualityUrl = getHighQualityUrl(src);

    images.push({
      src: highQualityUrl,
      originalSrc: src,
      alt,
      original: match[0],
    });
  }

  return images;
};

// Convert web-optimized URL to high-quality version
const getHighQualityUrl = (url) => {
  try {
    const urlObj = new URL(url);

    // For Wix static images, remove the optimization parameters
    if (urlObj.hostname.includes("wixstatic.com")) {
      // Extract the base media path
      const pathParts = urlObj.pathname.split("/");

      // Find the media ID (usually starts with the format /media/...)
      const mediaIndex = pathParts.findIndex((part) => part === "media");
      if (mediaIndex !== -1 && mediaIndex + 1 < pathParts.length) {
        const mediaId = pathParts[mediaIndex + 1];

        // Construct high-quality URL without size/quality parameters
        // Remove everything after the media ID that contains optimization params
        const cleanPath = `/media/${mediaId}`;
        const highQualityUrl = `${urlObj.protocol}//${urlObj.hostname}${cleanPath}`;

        console.log(`    Converting: ${url}`);
        console.log(`    To HQ:      ${highQualityUrl}`);

        return highQualityUrl;
      }
    }

    // If it's not a Wix URL or we can't parse it, try removing query parameters
    urlObj.search = "";
    return urlObj.toString();
  } catch (error) {
    console.log(`    Error parsing URL: ${url}`);
    return url;
  }
};

// Get file extension from URL or filename
const getExtension = (url, filename = "") => {
  try {
    // First try to get extension from filename in URL
    const pathname = new URL(url).pathname;
    let ext = path.extname(pathname);

    // If no extension from URL, try to infer from original filename
    if (!ext && filename) {
      if (filename.includes(".jpg") || filename.includes("jpg")) return ".jpg";
      if (filename.includes(".png") || filename.includes("png")) return ".png";
      if (filename.includes(".gif") || filename.includes("gif")) return ".gif";
      if (filename.includes(".webp") || filename.includes("webp"))
        return ".webp";
    }

    return ext || ".jpg"; // Default to .jpg
  } catch {
    return ".jpg";
  }
};

const scrapeHighQualityImages = async () => {
  console.log("Starting HIGH-QUALITY Roots Power image scraping...");

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
      const images = extractHighQualityImageUrls(html, pageInfo.url);

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
          img.src.includes("favicon") ||
          img.src.includes("google") ||
          img.src.length < 20
        ) {
          continue;
        }

        console.log(`  Downloading HQ image ${i + 1}:`);

        try {
          let filename;
          let category = pageInfo.category;

          // Determine filename and category based on known images
          if (img.src.includes("IMG_4068") || img.alt.includes("IMG_4068")) {
            filename = "IMG_4068_HQ";
            category = "home_page";
          } else if (
            img.src.includes("IMG_0966") ||
            img.alt.includes("IMG_0966")
          ) {
            filename = "IMG_0966_HQ";
            category = "home_page";
          } else if (
            img.src.includes("IMG_0042") ||
            img.alt.includes("IMG_0042")
          ) {
            filename = "IMG_0042_HQ";
            category = "home_page";
          } else if (
            img.src.includes("coast") &&
            img.originalSrc.includes("coast2")
          ) {
            filename = "coast2_HQ";
            category = "projects";
          } else if (
            img.src.includes("coast") ||
            img.originalSrc.includes("coast")
          ) {
            filename = "coast_HQ";
            category = "projects";
          } else if (
            img.src.includes("tree") ||
            img.originalSrc.includes("tree")
          ) {
            filename = "tree_HQ";
            category = "projects";
          } else if (
            img.src.includes("RootsPower") ||
            img.originalSrc.includes("RootsPower") ||
            img.alt.toLowerCase().includes("logo")
          ) {
            filename = "RootsPowerColorStacked_BLK_SM_HQ";
            category = "logo";
          } else {
            // Generate filename for other images
            const urlParts = img.src.split("/");
            let originalName = urlParts[urlParts.length - 1].split("?")[0];
            if (!originalName || originalName.length < 3) {
              originalName = `image_${i + 1}`;
            }
            // Remove file extension if present, we'll add it back
            originalName = originalName.replace(/\.[^/.]+$/, "");
            filename = `${pageInfo.name}_${originalName}_HQ`;
          }

          const extension = getExtension(img.src, img.originalSrc);
          const fullFilename = filename + extension;
          const filepath = path.join(
            "roots_power_images_hq",
            category,
            fullFilename
          );

          await downloadImage(img.src, filepath);

          downloadedImages.push({
            originalUrl: img.originalSrc,
            highQualityUrl: img.src,
            filename: fullFilename,
            category: category,
            page: pageInfo.name,
            alt: img.alt,
            filepath: filepath,
          });

          console.log(`    ✓ Saved HQ as: ${filepath}`);
        } catch (err) {
          console.log(`    ✗ Failed to download HQ: ${err.message}`);

          // Try fallback to original URL if high-quality version fails
          try {
            console.log(`    → Trying original URL as fallback...`);
            let filename;
            let category = pageInfo.category;

            if (img.alt.includes("IMG_4068")) {
              filename = "IMG_4068_fallback";
              category = "home_page";
            } else if (img.alt.includes("IMG_0966")) {
              filename = "IMG_0966_fallback";
              category = "home_page";
            } else if (img.alt.includes("IMG_0042")) {
              filename = "IMG_0042_fallback";
              category = "home_page";
            } else if (img.originalSrc.includes("coast")) {
              filename = "coast_fallback";
              category = "projects";
            } else if (img.originalSrc.includes("tree")) {
              filename = "tree_fallback";
              category = "projects";
            } else if (img.originalSrc.includes("RootsPower")) {
              filename = "logo_fallback";
              category = "logo";
            } else {
              filename = `${pageInfo.name}_${i + 1}_fallback`;
            }

            const extension = getExtension(img.originalSrc);
            const fullFilename = filename + extension;
            const filepath = path.join(
              "roots_power_images_hq",
              category,
              fullFilename
            );

            await downloadImage(img.originalSrc, filepath);

            downloadedImages.push({
              originalUrl: img.originalSrc,
              highQualityUrl: img.originalSrc,
              filename: fullFilename,
              category: category,
              page: pageInfo.name,
              alt: img.alt,
              filepath: filepath,
              note: "fallback_to_original",
            });

            console.log(`    ✓ Saved fallback as: ${filepath}`);
          } catch (fallbackErr) {
            console.log(`    ✗ Fallback also failed: ${fallbackErr.message}`);
          }
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
    quality_note:
      "High-quality versions extracted by removing web optimization parameters",
    images_by_category: {
      home_page: downloadedImages.filter((img) => img.category === "home_page"),
      projects: downloadedImages.filter((img) => img.category === "projects"),
      logo: downloadedImages.filter((img) => img.category === "logo"),
      other: downloadedImages.filter((img) => img.category === "other"),
    },
    all_images: downloadedImages,
  };

  fs.writeFileSync(
    "roots_power_images_hq/image_inventory_hq.json",
    JSON.stringify(inventory, null, 2)
  );

  console.log("\n=== HIGH-QUALITY SCRAPING COMPLETE ===");
  console.log(`Total HQ images downloaded: ${downloadedImages.length}`);
  console.log(
    `Home page images: ${inventory.images_by_category.home_page.length}`
  );
  console.log(
    `Project images: ${inventory.images_by_category.projects.length}`
  );
  console.log(`Logo images: ${inventory.images_by_category.logo.length}`);
  console.log(`Other images: ${inventory.images_by_category.other.length}`);
  console.log(
    "\nHQ Image inventory saved to: roots_power_images_hq/image_inventory_hq.json"
  );
  console.log("HQ Images organized in directories: roots_power_images_hq/");

  return inventory;
};

// Run the scraper
scrapeHighQualityImages().catch(console.error);
