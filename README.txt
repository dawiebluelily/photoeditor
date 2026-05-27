Blue Lily Agent Hub - Luxury Version

This is a Netlify-ready static app.

Files:
- index.html
- manifest.json
- sw.js
- assets/blue-lily-logo.png

How to deploy:
1. Upload the full folder contents to Netlify.
2. Keep the folder structure exactly the same.
3. Add your real document files into:
   assets/docs/
4. Use these exact file names unless you change the links inside index.html:
   01-otp.pdf
   02-ppra-mandatory-disclosure.pdf
   03-purchaser-particulars.pdf
   04-sellers-particulars.pdf
   05-commission-agreement.pdf
   06-additional-conditions.pdf
   07-open-mandate.docx
   08-exclusive-mandate.docx
   09-rental-mandate.pdf
   10-rental-application.pdf
   11-rental-mandatory-disclosure.pdf
   ppra-individual-application-form.pdf

Current live links included:
- PropCTRL
- Virtual Agent
- Loom
- CMA Builder
- Bond Calculator
- Photo Edits
- Compliance

Placeholder tiles:
- Complex Report
- Marketing Hub

These placeholders can be connected to future Blue Lily tools by changing the url value in the tools array inside index.html.


Latest structure update:
- Section 01: Agent Tools
- Section 02: Resources
- Section 03: Document Library
  - Sales Documents
  - Rental Documents

Logo update:
- The app now uses the supplied white Blue Lily Properties logo.


Latest interaction update:
- The Section 01 label was removed.
- Resources has been added as a tile next to Marketing Hub.
- Resources only opens when the Resources tile is clicked.
- Document Library only opens when the Document Library tile is clicked.
- Sales Documents and Rental Documents sit inside Document Library.

Latest toggle update:
- Clicking Resources once opens it.
- Clicking Resources again closes it.
- Clicking Document Library once opens it.
- Clicking Document Library again closes it.
- Opening one panel closes the other.

Latest cleanup:
- Removed the Blue Lily Properties / Agent Hub text block next to the logo.
- Removed the Agent Tools heading text.

Latest logo/header update:
- The app now uses the supplied long white Blue Lily Properties logo.
- The AGENT HUB wording is shown in the header.
- The duplicate Blue Lily Properties text block remains removed.

Latest visual update:
- Removed the checker/grid background from the logo asset.
- Removed the visible background grid from the app.
- Kept the fresh high-end navy/electric-blue look.

Latest logo correction:
- Rebuilt the logo from the original transparent Blue Lily logo.
- Created a clean horizontal white logo with no checker/grid background.
- Kept AGENT HUB wording.

Latest link update:
- Marketing Hub now opens the provided Google Drive folder.
- Complex Report now opens https://areareport.netlify.app/

Latest website update:
- Blue Lily Website now opens https://www.bluelilysa.co.za/ and sits directly after Loom.


Latest Neser Inc resources update:
- Resources now includes a Neser Inc Resources block.
- Added Transfer & Bond Cost Guide PDF.
- Added Property Transfer Process PDF.
- Service worker cache bumped to v3 to prevent old cached builds from loading.

Included Neser Inc document files:
- assets/docs/neser-transfer-and-bond-cost-guide.pdf
- assets/docs/neser-property-transfer-process.pdf


Latest PPRA document update:
- Document Library now includes a PPRA block.
- Added PPRA Individual Application Form PDF.
- Service worker cache bumped to v4 to prevent old cached builds from loading.

Included PPRA document file:
- assets/docs/ppra-individual-application-form.pdf
