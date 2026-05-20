'use client';
import styles from './page.module.scss';
import { Typography } from 'antd';

const { Title } = Typography;

export default function FaqPage() {
  return (
    <div id={styles['faq']}>
      <Title level={1}>Frequently Asked Questions</Title>
      <ol>
        <li>
          Where can I find my online ticket?
          <ul>
            <li>Go to Ayahay.com and click My Bookings.</li>
          </ul>
        </li>
        <li>
          Can I book a Car, motorbike, van and any rolling cargoes?
          <ol>
            <li>
              Yes, you can go to ayahay.com and choose your desired date and
              schedule
            </li>
            <li>Check if there are slots left for vehicles, if there is</li>
            <li>Input the driver’s name and click Add vehicle</li>
            <li>
              If there is not, call the number and provided in website and call
              our customer service to check if there are slots left.
            </li>
          </ol>
        </li>
        <li>
          Can I book tickets for PWD, Senior and students?
          <ul>
            <li>
              Unfortunately, with Aznar they don’t allow discounted rates to
              book online for now.
            </li>
          </ul>
        </li>
        <li>
          What is boarding time cut-off?
          <ul>
            <li>2 hours before the scheduled time of departure</li>
          </ul>
        </li>
        <li>
          What are the rules for Refund and rebooking?
          <ul>
            <li>
              For refund and rebooking policy, please check guidelines and
              policies of Aznar in Partners Page.
            </li>
          </ul>
        </li>
        <li>
          Is Minor and Infants free?
          <ul>
            <li>
              Passenger 2 years old and below is considered free of ticket/fare
              charge. Moreover, passenger between 3 to 11 years old are
              considered as child.
            </li>
          </ul>
        </li>
        <li>
          Where can I check the cancellation of trips due to weather conditions?
          <ul>
            <li>
              Check notification in ayahay.com, email you provided and check the
              facebook page of Aznar and Ayahay
            </li>
          </ul>
        </li>
        <li>
          How long is the ticket Validity?
          <ul>
            <li>30 days upon booking</li>
          </ul>
        </li>
        <li>
          Can I send cargoes with no driver/person (loose cargoes)?
          <ul>
            <li>Yes, visit Aznar ticketing office at the port area</li>
          </ul>
        </li>
        <li>
          Can I do advance booking?
          <ul>
            <li>Yes, you can do advance booking maximum of 2 month.</li>
          </ul>
        </li>
        <li>
          Can I travel with my pet/animals?
          <ul>
            <li>
              Yes, you need to provide shipping permit from Philippine Bureau of
              Animal Industry (National Veterinary Quarantine Services
              Division). Please click&nbsp;
              <a href='https://www.bai.gov.ph/lsp-faq' target='_blank'>
                here
              </a>
              .
            </li>
          </ul>
        </li>
        <li>
          Can I travel with hazardous material?
          <ul>
            <li>No. Please check Guidelines and Policies for more details.</li>
          </ul>
        </li>
      </ol>
    </div>
  );
}
