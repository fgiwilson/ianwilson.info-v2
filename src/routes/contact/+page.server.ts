import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/server/db.js';

import nodemailer from 'nodemailer';

const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY as string;

export const load = () => {
	return {
		siteKey
	};
};

interface TokenValidateResponse {
	'error-codes': string[];
	success: boolean;
	action: string;
	cdata: string;
}

async function validateToken(token: string, secret: string) {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			secret: secret,
			response: token
		})
	});
	const data: TokenValidateResponse = await response.json();
	return {
		// Return the status
		success: data.success,

		// Return the first error if it exists
		error: data['error-codes']?.length ? data['error-codes'][0] : null
	};
}

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
	host: 'smtp.useplunk.com', // Replace with your SMTP host
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER, // Replace with your email
		pass: process.env.EMAIL_PASS // Replace with your email password or app password
	}
});

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const subject = formData.get('subject')?.toString();
		const message = formData.get('message')?.toString();
		const consultingInterest = formData.get('consultingInterest') === 'on';
		const token = formData.get('cf-turnstile-response');
		const secretKey = process.env.TURNSTILE_SECRET_KEY as string;

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return fail(400, {
				error: 'All fields are required',
				name,
				email,
				subject,
				message,
				consultingInterest
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Please enter a valid email address',
				name,
				email,
				subject,
				message,
				consultingInterest
			});
		}
		const { success, error } = await validateToken(token?.toString() || '', secretKey);

		// If Turnstile validation fails, return a specific error
		if (!success) {
			return fail(400, {
				error: 'CAPTCHA validation failed. Please try again.',
				name,
				email,
				subject,
				message,
				consultingInterest
			});
		}
		if (error) {
			console.error(error);
		}

		try {
			// Store the contact message in the database
			await prisma.contactMessage.create({
				data: {
					name,
					email,
					subject,
					message,
					consultingInterest
				}
			});

			// Send email notification
			try {
				await transporter.sendMail({
					from: 'ian@ianwilson.info',
					to: 'ian@wilsonsdesigns.com', // Replace with your receiving email
					subject: `Contact Form: ${subject}`,
					text: `
            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            Interested in Consulting: ${consultingInterest ? 'Yes' : 'No'}
            
            Message:
            ${message}
          `,
					html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Interested in Consulting:</strong> ${consultingInterest ? 'Yes' : 'No'}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #2D5A5C;">
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This message was sent from the contact form on your website.
              </p>
            </div>
          `
				});

				console.log('Email notification sent successfully');
			} catch (emailError) {
				console.error('Error sending email notification:', emailError);
				// Continue even if email fails - we've already saved to DB
			}

			// Return success
			return { success: true };
		} catch (error) {
			console.error('Error processing contact form:', error);
			return fail(500, {
				error: 'There was an error processing your request. Please try again later.',
				name,
				email,
				subject,
				message,
				consultingInterest
			});
		}
	}
};
