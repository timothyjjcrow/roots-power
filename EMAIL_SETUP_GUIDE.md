# Email Form Setup Guide

## Option 1: EmailJS Setup (Recommended - Easiest)

EmailJS allows you to send emails directly from your website without needing a backend server.

### Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

### Step 2: Connect Your Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions to connect your email account
5. Note down your **Service ID** (you'll need this)

### Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:** New Inquiry from {{from_firstName}} {{from_lastName}} - Roots Power

**Content:**

```
You have a new inquiry from your website!

Contact Information:
Name: {{from_firstName}} {{from_lastName}}
Email: {{from_email}}
Phone: {{from_phone}}
Service Type: {{service_type}}

Message:
{{message}}

---
This message was sent from the Roots Power contact form.
Reply directly to this email to respond to the customer.
```

4. Save the template and note down your **Template ID**

### Step 4: Get Your User ID

1. Go to "Account" in your EmailJS dashboard
2. Copy your **Public Key** (this is your User ID)

### Step 5: Update Your Website Code

In your `script.js` file, replace these placeholders:

```javascript
emailjs.init("YOUR_EMAILJS_USER_ID"); // Replace with your Public Key
```

```javascript
emailjs.send(
  "YOUR_SERVICE_ID", // Replace with your Service ID
  "YOUR_TEMPLATE_ID", // Replace with your Template ID
  templateParams
);
```

### Step 6: Test Your Form

1. Fill out your contact form with test data
2. Submit the form
3. Check your email inbox for the message
4. Check EmailJS dashboard for sending statistics

---

## Option 2: Formspree (Alternative Easy Solution)

If you prefer not to use EmailJS, Formspree is another simple option:

### Step 1: Create Formspree Account

1. Go to [https://formspree.io/](https://formspree.io/)
2. Sign up for a free account (50 submissions/month)

### Step 2: Create Form Endpoint

1. Create a new form in your dashboard
2. Get your form endpoint URL (looks like: `https://formspree.io/f/xyzabc123`)

### Step 3: Update Contact Form

Replace the EmailJS code in `script.js` with this Formspree code:

```javascript
// ===== CONTACT FORM HANDLING (FORMSPREE VERSION) =====
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    showFormLoading();

    const formData = new FormData(this);

    fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          showFormSuccess();
          contactForm.reset();
        } else {
          showFormError();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showFormError();
      });
  });
}
```

---

## Option 3: Server-Side Solution (Advanced)

For more control and professional features, you can set up a backend server:

### Node.js + Express + Nodemailer

This requires hosting with Node.js support (like Vercel, Netlify Functions, or a VPS).

**Benefits:**

- Full control over email sending
- Can integrate with databases
- No third-party dependencies
- Better security

**Setup Steps:**

1. Create `package.json`
2. Install dependencies: `npm install express nodemailer cors`
3. Create server endpoint
4. Update frontend to send POST requests to your server

Would you like detailed instructions for the server-side option?

---

## Security Considerations

### For EmailJS:

- Your Public Key is safe to expose in frontend code
- Rate limiting is handled by EmailJS
- Spam protection included

### For Formspree:

- Form endpoint can be public
- Built-in spam protection
- Rate limiting included

### For Server-Side:

- Keep email credentials in environment variables
- Implement rate limiting
- Add CAPTCHA if needed
- Validate all inputs server-side

---

## Troubleshooting

### Common Issues:

1. **Emails not sending**: Check your Service/Template IDs
2. **Emails going to spam**: Add proper SPF/DKIM records
3. **Rate limiting**: Upgrade your plan or implement client-side validation
4. **CORS errors**: Ensure your domain is added to allowed origins

### Testing:

- Test with different email addresses
- Check spam folders
- Monitor service dashboards
- Use browser developer tools to check for errors

---

## Recommended Choice

For Roots Power, I recommend **EmailJS** because:

- ✅ Easy setup (no backend required)
- ✅ Free tier sufficient for small business
- ✅ Professional email templates
- ✅ Good reliability and uptime
- ✅ Integrates with your existing Gmail/business email

The current code is already set up for EmailJS - you just need to add your IDs!
