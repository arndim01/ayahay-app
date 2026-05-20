'use client';
import { Typography } from 'antd';
import styles from './page.module.scss';
import ProfileCard from '@/components/about/ProfileCard';

const { Title } = Typography;

export default function AboutUs() {
  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 30 }}>
        Who Are We
      </Title>
      <div className={styles['cards']}>
        <ProfileCard
          srcImage='/assets/jay-engalla.jpg'
          linkedinUrl='https://www.linkedin.com/in/jay-mark-engalla-537210b8/'
          name='Jay Mark Engalla'
          position='Chief Executive Officer'
        />
        <ProfileCard
          srcImage='/assets/josef-arroyo.jpg'
          linkedinUrl='https://www.linkedin.com/in/josef-michael-arroyo-jmja007/'
          name='Josef Michael Arroyo'
          position='Chief Operating Officer'
        />
        <ProfileCard
          srcImage='/assets/tonee-atil.jpg'
          linkedinUrl='https://www.linkedin.com/in/tonee-pacres-atil-92b3a3292/'
          name='Tonee Pacres-Atil'
          position='Chief Financial Officer'
        />
        <ProfileCard
          srcImage='/assets/james-atil.jpg'
          linkedinUrl='https://www.linkedin.com/in/jamesatil/'
          name='James Atil'
          position='Chief Risk Officer'
        />
        <ProfileCard
          srcImage='/assets/carlos-ngo.jpg'
          linkedinUrl='https://www.linkedin.com/in/carlosngo/'
          name='Carlos Ngo'
          position='Chief Technology Officer'
        />
        <ProfileCard
          srcImage='/assets/chester-sy.jpg'
          linkedinUrl='https://www.linkedin.com/in/chester-nevan-sy/'
          name='Chester Nevan Sy'
          position='Chief Product Officer'
        />
      </div>
      <Title level={1} className={styles['title']} style={{ fontSize: 30 }}>
        About Us
      </Title>
      <p>
        Welcome to Ayahay, where innovation meets expertise in the world of
        logistics and technology. We are a dynamic and forward-thinking company
        founded by individuals with a wealth of experience in the IT and
        logistics industry. Our journey began with a shared vision: to
        revolutionize the way logistics and transportation are managed and
        experienced in the Philippines.
      </p>
      <Title level={1} className={styles['title']} style={{ fontSize: 30 }}>
        Our Story
      </Title>
      <p>
        Ayahay was born out of a deep understanding of the challenges faced by
        the shipping and logistics industry in adapting to the digital age. The
        founders of Ayahay brought together their extensive knowledge and
        experience in IT and logistics to create a solution that would bridge
        the gap between traditional practices and modern technology.
      </p>
      <Title level={1} className={styles['title']} style={{ fontSize: 30 }}>
        Expertise in IT Logistics
      </Title>
      <p>
        Our team comprises experts who have spent years working at the
        intersection of information technology and logistics. We understand the
        intricacies of supply chain management, fleet operations, and passenger
        services. This expertise has allowed us to design and develop innovative
        solutions that address the unique needs of the logistics and shipping
        industry.
      </p>
      <Title level={1} className={styles['title']} style={{ fontSize: 30 }}>
        Mission
      </Title>
      <p>
        Our mission is to empower businesses in the shipping line industry to
        adapt to advanced technology and digitization. We aim to make it easier
        for businesses to manage their fleets and enhance the sea travel
        experience for passengers, saving them time and ensuring a hassle-free
        journey.
      </p>
      <Title level={1} className={styles['title']} style={{ fontSize: 30 }}>
        Vision
      </Title>
      <p>
        At Ayahay, we envision a future where the shipping line industry in the
        Philippines fully embraces technology, becoming digitally connected and
        customer-centric. We aim to lead the way in revolutionizing sea travel
        by providing a user-friendly platform that simplifies booking, enhances
        communication, and ensures stress-free journeys for passengers.
      </p>
    </div>
  );
}
