'use client';
import styles from './page.module.scss';
import { Typography } from 'antd';

const { Title } = Typography;

export default function PrivacyPolicyPage() {
  return (
    <div id={styles['privacy-policy']}>
      <Title level={1}>Privacy Policy</Title>
      <p>Effective Date: January 1, 2024</p>
      <p>
        Welcome to Ayahay. Your privacy is important to us, and we are committed
        to protecting your personal information. This Privacy Policy explains
        how we collect, use, and safeguard your data.
      </p>
      <Title level={2}>1. Information We Collect</Title>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          Personal Information: This includes your name, contact information,
          and payment details.
        </li>
        <li>
          Transaction Information: Information related to transactions you
          conduct on the Marketplace.
        </li>
        <li>
          User Content: Any content you create, upload, or share on the
          Marketplace, such as product listings and reviews.
        </li>
        <li>
          Device and Usage Information: Information about your device and how
          you use our services.
        </li>
      </ul>
      <Title level={2}>2. How We Use Your Information</Title>
      <p>We use your information for various purposes, including:</p>
      <ul>
        <li>Facilitating transactions and providing customer support.</li>
        <li>Personalizing your experience and improving our services.</li>
        <li>
          Communicating with you about updates, promotions, and account-related
          matters.
        </li>
      </ul>
      <Title level={2}>3. Sharing Your Information</Title>
      <p>We may share your information with:</p>
      <ul>
        <li>Sellers or buyers involved in your transactions.</li>
        <li>Service providers who help us deliver our services.</li>
        <li>Legal authorities when required to comply with the law.</li>
      </ul>
      <Title level={2}>4. Security</Title>
      <p>
        We employ reasonable security measures to protect your data. However, no
        method of transmission over the internet is entirely secure, and we
        cannot guarantee the absolute security of your data.
      </p>
      <Title level={2}>5. Your Choices</Title>
      <p>You can control how your information is used by:</p>
      <ul>
        <li>Reviewing and editing your account settings.</li>
        <li>Managing your communication preferences.</li>
      </ul>
      <Title level={2}>6. Children's Privacy</Title>
      <p>
        Our services are not intended for children under the age of 13. We do
        not knowingly collect data from individuals under 13 years of age.
      </p>
      <Title level={2}>7. Updates to this Privacy Policy</Title>
      <p>
        We may update this Privacy Policy to reflect changes in our practices.
        We will notify you of any material changes by posting the updated policy
        on our website.
      </p>
      <Title level={2}>8. Contact Us</Title>
      <p>
        If you have any questions or concerns about this Privacy Policy or your
        data, please contact us at [Your Contact Information].
      </p>
    </div>
  );
}
