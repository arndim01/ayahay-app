import { Card } from 'antd';
import styles from './ProfileCard.module.scss';

interface ProfileCardProps {
  srcImage: string;
  linkedinUrl: string;
  name: string;
  position: string;
}

export default function ProfileCard({
  srcImage,
  linkedinUrl,
  name,
  position,
}: ProfileCardProps) {
  return (
    <Card
      hoverable
      className={styles['card']}
      cover={
        <img alt='profile pic' className={styles['image']} src={srcImage} />
      }
      onClick={() => {
        window.open(linkedinUrl, '_blank');
      }}
    >
      <div>
        <strong>{name}</strong>
      </div>
      <div>{position}</div>
    </Card>
  );
}
