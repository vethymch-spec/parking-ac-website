const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const params = new URLSearchParams(event.body);
    const name = params.get('name') || '';
    const email = params.get('email') || '';
    const subject = params.get('subject') || 'General Inquiry';
    const message = params.get('message') || '';
    
    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 302,
        headers: {
          'Location': '/contact?error=missing-fields',
        },
        body: '',
      };
    }
    
    // Create Zoho SMTP transporter
    // Note: User needs to set ZOHO_EMAIL and ZOHO_PASSWORD in Netlify environment variables
    const transporter = nodemailer.createTransporter({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL || 'support@cooldrivepro.com',
        pass: process.env.ZOHO_PASSWORD || '',
      },
    });
    
    // Send email
    await transporter.sendMail({
      from: `"CoolDrivePro Contact Form" <${process.env.ZOHO_EMAIL || 'support@cooldrivepro.com'}>`,
      to: process.env.ZOHO_EMAIL || 'support@cooldrivepro.com',
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    
    console.log('Email sent successfully for:', email);
    
    return {
      statusCode: 302,
      headers: {
        'Location': '/contact?success=true',
      },
      body: '',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': '/contact?error=send-failed',
      },
      body: '',
    };
  }
};
