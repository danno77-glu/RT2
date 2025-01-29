import html2pdf from 'html2pdf.js';
import { imageToBase64 } from '../../../utils/assetPaths';

export const generatePDF = async ({ content, filename }) => {
  const element = document.createElement('div');
  
  // Convert logo to base64 for PDF generation
  try {
    const logoUrl = new URL('/assets/images/logo1.png', window.location.origin);
    const logoBase64 = await imageToBase64(logoUrl);
    if (logoBase64) {
      content = content.replace(/src="\/assets\/images\/logo1\.png"/g, `src="${logoBase64}"`);
    }
  } catch (error) {
    console.error('Error converting logo to base64:', error);
  }
  
  element.innerHTML = content;
  document.body.appendChild(element);

  const opt = {
    margin: [15, 15],
    filename: filename,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
      putOnlyUsedFonts: true
    },
    pagebreak: { mode: 'avoid-all' }
  };

  try {
    // Wait for the DOM to update before generating the PDF
    await new Promise(resolve => setTimeout(resolve, 100));
    const pdf = await html2pdf().set(opt).from(element).output('blob');

    // Create a download link
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } finally {
    document.body.removeChild(element);
  }
};
