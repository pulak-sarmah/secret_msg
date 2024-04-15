import { resend } from './resend'
import VerificationEmail from '../emails/VerificationEmail'
import { ApiResponse } from '../types/ApiResponse'

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Secret Messages | verification code',
      react: VerificationEmail({
        username,
        otp: verifyCode,
      }),
    })

    return {
      success: true,
      message: 'Verification email sent',
    }
  } catch (emialError) {
    return {
      success: false,
      message: 'Failed to send verification email',
    }
  }
}