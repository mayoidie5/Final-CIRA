import React from 'react';

interface EmailTemplateProps {
  verificationLink: string;
  userEmail: string;
  appName: string;
}

export const EmailVerificationTemplate: React.FC<EmailTemplateProps> = ({
  verificationLink,
  userEmail,
  appName,
}) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1e40af',
        color: '#ffffff',
        padding: '30px',
        borderRadius: '8px 8px 0 0',
        textAlign: 'center',
      }}>
        <h1 style={{ margin: '0', fontSize: '28px' }}>Email Verification</h1>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px 30px',
        borderRadius: '0 0 8px 8px',
      }}>
        <p style={{
          fontSize: '16px',
          color: '#333333',
          marginBottom: '20px',
        }}>
          Hello,
        </p>

        <p style={{
          fontSize: '16px',
          color: '#333333',
          marginBottom: '30px',
          lineHeight: '1.6',
        }}>
          Thank you for creating an account with <strong>{appName}</strong>! 
          To complete your registration and verify your email address, please click the button below:
        </p>

        {/* Verification Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          <a
            href={verificationLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '14px 40px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease',
            }}
          >
            Verify Email Address
          </a>
        </div>

        {/* Alternative Link */}
        <p style={{
          fontSize: '14px',
          color: '#666666',
          marginBottom: '20px',
        }}>
          Or copy and paste this link in your browser:
        </p>

        <p style={{
          fontSize: '13px',
          color: '#2563eb',
          backgroundColor: '#f0f4ff',
          padding: '15px',
          borderRadius: '4px',
          wordBreak: 'break-all',
          margin: '0 0 30px 0',
        }}>
          {verificationLink}
        </p>

        {/* Important Note */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '30px',
        }}>
          <p style={{
            fontSize: '14px',
            color: '#92400e',
            margin: '0',
          }}>
            <strong>Note:</strong> This verification link will expire in 24 hours. 
            If you didn't create an account, please ignore this email.
          </p>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '14px',
          color: '#666666',
          marginBottom: '10px',
        }}>
          Account Email: <strong>{userEmail}</strong>
        </p>

        <p style={{
          fontSize: '12px',
          color: '#999999',
          marginBottom: '0',
          lineHeight: '1.6',
        }}>
          If you have any questions or need assistance, please contact our support team.
          <br />
          <br />
          Best regards,<br />
          <strong>{appName} Team</strong>
        </p>
      </div>

      {/* Footer Bar */}
      <div style={{
        backgroundColor: '#f0f4ff',
        padding: '20px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666666',
        borderRadius: '0 0 8px 8px',
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          © 2025 {appName}. All rights reserved.
        </p>
        <p style={{ margin: '0' }}>
          Polytechnic University of the Philippines | College of Engineering and Information Technology
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationTemplate;
